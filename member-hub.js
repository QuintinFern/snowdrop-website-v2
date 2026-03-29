/**
 * Member Hub — blog, profile, groups, files, map pins, calendar.
 * Requires Firestore + Storage rules for authenticated users.
 */
import {
    auth,
    db,
    storage,
    onAuthStateChanged,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    ref,
    uploadBytes,
    getDownloadURL,
    Timestamp,
} from './firebase-config.js';
import { isLoginNavVisible } from './auth-flags.js';

let currentUser = null;
let mapInstance = null;
let markersLayer = null;
let eventsCache = [];
let calendarMonth = new Date();
let selectedCalendarDay = null;

function toast(msg, isErr = false) {
    const t = document.createElement('div');
    t.className = `hub-toast${isErr ? ' hub-toast--err' : ''}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3800);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.hub-tab');
    const panels = document.querySelectorAll('.hub-panel');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const id = tab.getAttribute('data-hub-tab');
            tabs.forEach((t) => t.classList.remove('is-active'));
            panels.forEach((p) => p.classList.remove('is-active'));
            tab.classList.add('is-active');
            const panel = document.getElementById(`hub-panel-${id}`);
            if (panel) panel.classList.add('is-active');
            if (id === 'map' && mapInstance) {
                setTimeout(() => mapInstance.invalidateSize(), 200);
            }
        });
    });
}

/* -------- Blog -------- */
function initBlog() {
    const form = document.getElementById('hub-post-form');
    const list = document.getElementById('hub-post-list');
    if (!form || !list) return;

    const q = query(collection(db, 'memberPosts'), orderBy('createdAt', 'desc'));
    onSnapshot(
        q,
        (snap) => {
            list.innerHTML = '';
            if (snap.empty) {
                list.innerHTML = '<p class="hub-empty">No posts yet. Write the first one!</p>';
                return;
            }
            snap.forEach((d) => {
                const p = d.data();
                const date = p.createdAt?.toDate
                    ? p.createdAt.toDate().toLocaleString()
                    : '';
                const article = document.createElement('article');
                article.className = 'hub-post';
                article.innerHTML = `
                    <h3>${escapeHtml(p.title || 'Untitled')}</h3>
                    <div class="hub-post-meta">${escapeHtml(p.authorName || p.authorEmail || 'Member')} · ${escapeHtml(date)}</div>
                    <p class="hub-post-body">${escapeHtml(p.content || '')}</p>
                `;
                list.appendChild(article);
            });
        },
        () => {
            list.innerHTML =
                '<p class="hub-empty">Could not load posts. Check Firestore rules for collection <code>memberPosts</code>.</p>';
        }
    );

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('hub-post-title').value.trim();
        const content = document.getElementById('hub-post-body').value.trim();
        if (!title || !content) {
            toast('Title and body are required.', true);
            return;
        }
        try {
            await addDoc(collection(db, 'memberPosts'), {
                title,
                content,
                authorUid: currentUser.uid,
                authorEmail: currentUser.email || '',
                authorName: document.getElementById('hub-profile-name')?.value?.trim() || '',
                createdAt: serverTimestamp(),
            });
            form.reset();
            toast('Post published.');
        } catch (err) {
            console.error(err);
            toast('Could not publish post.', true);
        }
    });
}

/* -------- Profile -------- */
async function initProfile() {
    const form = document.getElementById('hub-profile-form');
    if (!form) return;

    const nameEl = document.getElementById('hub-profile-name');
    const bioEl = document.getElementById('hub-profile-bio');
    const phoneEl = document.getElementById('hub-profile-phone');

    const refDoc = doc(db, 'memberProfiles', currentUser.uid);
    try {
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
            const d = snap.data();
            if (nameEl) nameEl.value = d.displayName || '';
            if (bioEl) bioEl.value = d.bio || '';
            if (phoneEl) phoneEl.value = d.phone || '';
        }
    } catch (e) {
        console.warn('Profile load', e);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await setDoc(
                refDoc,
                {
                    displayName: nameEl?.value?.trim() || '',
                    bio: bioEl?.value?.trim() || '',
                    phone: phoneEl?.value?.trim() || '',
                    email: currentUser.email || '',
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            toast('Profile saved.');
        } catch (err) {
            console.error(err);
            toast('Could not save profile.', true);
        }
    });
}

/* -------- Groups -------- */
function initGroups() {
    const list = document.getElementById('hub-groups-list');
    const createForm = document.getElementById('hub-group-create');
    if (!list) return;

    const q = query(collection(db, 'memberGroups'), orderBy('createdAt', 'desc'));
    onSnapshot(
        q,
        (snap) => {
            list.innerHTML = '';
            if (snap.empty) {
                list.innerHTML = '<p class="hub-empty">No groups yet. Create one below.</p>';
                return;
            }
            snap.forEach((d) => {
                const g = d.data();
                const members = Array.isArray(g.memberIds) ? g.memberIds : [];
                const isMember = members.includes(currentUser.uid);
                const card = document.createElement('div');
                card.className = 'hub-group-card';
                card.innerHTML = `
                    <h3>${escapeHtml(g.name || 'Group')}</h3>
                    <p>${escapeHtml(g.description || '')}</p>
                    <p style="font-size:0.8rem;color:var(--hub-muted);">${members.length} member(s)</p>
                `;
                const row = document.createElement('div');
                row.className = 'hub-btn-row';
                if (isMember) {
                    const leave = document.createElement('button');
                    leave.type = 'button';
                    leave.className = 'hub-btn hub-btn--ghost';
                    leave.textContent = 'Leave group';
                    leave.addEventListener('click', async () => {
                        try {
                            await updateDoc(doc(db, 'memberGroups', d.id), {
                                memberIds: arrayRemove(currentUser.uid),
                            });
                            toast('Left group.');
                        } catch (err) {
                            console.error(err);
                            toast('Could not leave.', true);
                        }
                    });
                    row.appendChild(leave);
                } else {
                    const join = document.createElement('button');
                    join.type = 'button';
                    join.className = 'hub-btn hub-btn--primary';
                    join.textContent = 'Join group';
                    join.addEventListener('click', async () => {
                        try {
                            await updateDoc(doc(db, 'memberGroups', d.id), {
                                memberIds: arrayUnion(currentUser.uid),
                            });
                            toast('Joined group.');
                        } catch (err) {
                            console.error(err);
                            toast('Could not join.', true);
                        }
                    });
                    row.appendChild(join);
                }
                card.appendChild(row);
                list.appendChild(card);
            });
        },
        () => {
            list.innerHTML =
                '<p class="hub-empty">Could not load groups. Check Firestore rules for <code>memberGroups</code>.</p>';
        }
    );

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('hub-group-name').value.trim();
            const description = document.getElementById('hub-group-desc').value.trim();
            if (!name) {
                toast('Group name required.', true);
                return;
            }
            try {
                await addDoc(collection(db, 'memberGroups'), {
                    name,
                    description,
                    memberIds: [currentUser.uid],
                    createdBy: currentUser.uid,
                    createdAt: serverTimestamp(),
                });
                createForm.reset();
                toast('Group created.');
            } catch (err) {
                console.error(err);
                toast('Could not create group.', true);
            }
        });
    }
}

/* -------- Files -------- */
function initFiles() {
    const input = document.getElementById('hub-file-input');
    const btn = document.getElementById('hub-file-upload-btn');
    const list = document.getElementById('hub-file-list');
    if (!input || !btn || !list) return;

    const q = query(collection(db, 'memberFiles'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snap) => {
        list.innerHTML = '';
        if (snap.empty) {
            list.innerHTML = '<li class="hub-empty" style="border:none;padding:16px">No files uploaded yet.</li>';
            return;
        }
        snap.forEach((d) => {
            const f = d.data();
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = f.originalName || 'File';
            const a = document.createElement('a');
            if (f.downloadURL) a.href = f.downloadURL;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = 'Download';
            li.appendChild(nameSpan);
            li.appendChild(a);
            list.appendChild(li);
        });
    });

    btn.addEventListener('click', async () => {
        const file = input.files?.[0];
        if (!file) {
            toast('Choose a file first.', true);
            return;
        }
        try {
            const safeName = file.name.replace(/[^\w.\-]+/g, '_');
            const path = `memberHub/${currentUser.uid}/${Date.now()}_${safeName}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await addDoc(collection(db, 'memberFiles'), {
                originalName: file.name,
                downloadURL,
                storagePath: path,
                uploaderUid: currentUser.uid,
                uploaderEmail: currentUser.email || '',
                createdAt: serverTimestamp(),
            });
            input.value = '';
            toast('File uploaded.');
        } catch (err) {
            console.error(err);
            toast('Upload failed. Check Storage rules.', true);
        }
    });
}

/* -------- Map -------- */
function initMap() {
    const el = document.getElementById('hub-map');
    const form = document.getElementById('hub-map-form');
    if (!el || typeof L === 'undefined') {
        if (el) el.innerHTML = '<p class="hub-empty">Map library failed to load.</p>';
        return;
    }

    mapInstance = L.map(el).setView([29.76, -95.37], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);

    const latInput = document.getElementById('hub-map-lat');
    const lngInput = document.getElementById('hub-map-lng');

    mapInstance.on('click', (ev) => {
        latInput.value = ev.latlng.lat.toFixed(5);
        lngInput.value = ev.latlng.lng.toFixed(5);
    });

    const q = query(collection(db, 'memberMapMarkers'), orderBy('createdAt', 'desc'));
    onSnapshot(
        q,
        (snap) => {
            markersLayer.clearLayers();
            snap.forEach((d) => {
                const m = d.data();
                if (typeof m.lat !== 'number' || typeof m.lng !== 'number') return;
                const marker = L.marker([m.lat, m.lng]).bindPopup(
                    `<strong>${escapeHtml(m.title || '')}</strong><br>${escapeHtml(m.description || '')}`
                );
                marker.addTo(markersLayer);
            });
        },
        () => {}
    );

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('hub-map-title').value.trim();
            const description = document.getElementById('hub-map-desc').value.trim();
            const lat = parseFloat(latInput.value);
            const lng = parseFloat(lngInput.value);
            if (!title || Number.isNaN(lat) || Number.isNaN(lng)) {
                toast('Title and valid coordinates required (use map click).', true);
                return;
            }
            try {
                await addDoc(collection(db, 'memberMapMarkers'), {
                    title,
                    description,
                    lat,
                    lng,
                    authorUid: currentUser.uid,
                    createdAt: serverTimestamp(),
                });
                form.reset();
                latInput.value = '';
                lngInput.value = '';
                toast('Place added to map.');
            } catch (err) {
                console.error(err);
                toast('Could not save map place.', true);
            }
        });
    }
}

/* -------- Calendar -------- */
function initCalendar() {
    const form = document.getElementById('hub-event-form');
    const q = query(collection(db, 'memberEvents'), orderBy('eventDate', 'asc'));
    onSnapshot(
        q,
        (snap) => {
            eventsCache = [];
            snap.forEach((d) => eventsCache.push({ id: d.id, ...d.data() }));
            renderCalendarGrid();
            renderEventListForSelection();
        },
        () => {}
    );

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('hub-event-title').value.trim();
            const notes = document.getElementById('hub-event-notes').value.trim();
            const local = document.getElementById('hub-event-datetime').value;
            if (!title || !local) {
                toast('Title and date/time required.', true);
                return;
            }
            const eventDate = Timestamp.fromDate(new Date(local));
            try {
                await addDoc(collection(db, 'memberEvents'), {
                    title,
                    notes,
                    eventDate,
                    authorUid: currentUser.uid,
                    createdAt: serverTimestamp(),
                });
                form.reset();
                toast('Event added.');
            } catch (err) {
                console.error(err);
                toast('Could not save event.', true);
            }
        });
    }

    document.getElementById('hub-cal-prev')?.addEventListener('click', () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        selectedCalendarDay = null;
        renderCalendarGrid();
        renderEventListForSelection();
    });
    document.getElementById('hub-cal-next')?.addEventListener('click', () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        selectedCalendarDay = null;
        renderCalendarGrid();
        renderEventListForSelection();
    });

    renderCalendarGrid();
    renderEventListForSelection();
}

function renderCalendarGrid() {
    const titleEl = document.getElementById('hub-cal-month-label');
    const gridEl = document.getElementById('hub-cal-grid');
    if (!titleEl || !gridEl) return;

    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    titleEl.textContent = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const today = new Date();

    const daysInMonth = last.getDate();
    gridEl.innerHTML = '';

    for (let i = 0; i < startPad; i++) {
        const c = document.createElement('div');
        c.className = 'hub-cal-cell hub-cal-cell--muted';
        gridEl.appendChild(c);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'hub-cal-cell';
        cell.textContent = String(d);
        const thisDate = new Date(y, m, d);
        const has = eventsCache.some((ev) => {
            const ed = ev.eventDate?.toDate?.();
            if (!ed) return false;
            return ed.getFullYear() === y && ed.getMonth() === m && ed.getDate() === d;
        });
        if (has) cell.classList.add('hub-cal-cell--has-event');
        if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) {
            cell.classList.add('hub-cal-cell--today');
        }
        if (
            selectedCalendarDay &&
            y === selectedCalendarDay.y &&
            m === selectedCalendarDay.m &&
            d === selectedCalendarDay.d
        ) {
            cell.classList.add('hub-cal-cell--selected');
        }
        cell.addEventListener('click', () => {
            selectedCalendarDay = { y, m, d };
            renderCalendarGrid();
            renderEventListForSelection();
        });
        gridEl.appendChild(cell);
    }
}

function renderEventListForSelection() {
    const container = document.getElementById('hub-event-list');
    if (!container) return;

    const label = document.getElementById('hub-event-list-label');
    if (selectedCalendarDay) {
        const { y, m, d } = selectedCalendarDay;
        if (label) {
            label.textContent = `Events on ${m + 1}/${d}/${y}`;
        }
        const filtered = eventsCache.filter((ev) => {
            const ed = ev.eventDate?.toDate?.();
            if (!ed) return false;
            return ed.getFullYear() === y && ed.getMonth() === m && ed.getDate() === d;
        });
        if (filtered.length === 0) {
            container.innerHTML = '<p class="hub-empty">No events this day.</p>';
            return;
        }
        container.innerHTML = filtered
            .map(
                (ev) => `
            <div class="hub-post" style="margin-bottom:10px">
                <h3 style="font-size:1rem">${escapeHtml(ev.title)}</h3>
                <div class="hub-post-meta">${ev.eventDate?.toDate?.().toLocaleString?.() || ''}</div>
                <p class="hub-post-body" style="font-size:0.9rem">${escapeHtml(ev.notes || '')}</p>
            </div>
        `
            )
            .join('');
    } else {
        if (label) label.textContent = 'Upcoming (all)';
        const upcoming = eventsCache
            .filter((ev) => ev.eventDate?.toDate?.() >= new Date(new Date().setHours(0, 0, 0, 0)))
            .sort((a, b) => a.eventDate.toDate() - b.eventDate.toDate());
        if (upcoming.length === 0) {
            container.innerHTML = '<p class="hub-empty">No upcoming events. Add one or pick a day.</p>';
            return;
        }
        container.innerHTML = upcoming
            .slice(0, 12)
            .map(
                (ev) => `
            <div class="hub-post" style="margin-bottom:10px">
                <h3 style="font-size:1rem">${escapeHtml(ev.title)}</h3>
                <div class="hub-post-meta">${ev.eventDate?.toDate?.().toLocaleString?.() || ''}</div>
                <p class="hub-post-body" style="font-size:0.9rem">${escapeHtml(ev.notes || '')}</p>
            </div>
        `
            )
            .join('');
    }
}

function escapeHtml(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

export function startMemberHub() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = isLoginNavVisible() ? 'login.html' : 'index.html';
            return;
        }
        currentUser = user;
        document.getElementById('hub-user-email').textContent = user.email || 'Member';
        setupTabs();
        initBlog();
        initProfile();
        initGroups();
        initFiles();
        initMap();
        initCalendar();
    });
}
