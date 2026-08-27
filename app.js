document.addEventListener('DOMContentLoaded', () => {

    // Note: Mobile menu logic is now handled in components.js

    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SLIDE_MS = 650;
    const AUTOPLAY_MS = 5000;
    const EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';

    // Filenames in /images are not consistently cased (some are .JPG). Static hosts
    // like GitHub Pages are case-sensitive, so try each candidate before giving up.
    const IMAGE_EXTENSIONS = ['.jpg', '.JPG', '.jpeg', '.png'];
    const IMAGE_RETRIES = 2;      // per extension, for transient network failures
    const RETRY_DELAY_MS = 350;

    // ================= PHOTO SLIDERS =================
    // count must match the number of images actually present in /images,
    // otherwise the slider ends up with blank slides.
    const sliderSets = {
        'event-slider': {
            prefix: 'event-photo',
            count: 8,
            alt: (n) => `Snowdrop United volunteers at a hope event (photo ${n})`,
        },
        'about-header-slider': {
            prefix: 'collage-about-us',
            count: 3,
            alt: (n) => `Snowdrop United team moment ${n}`,
        },
        'hope-header-slider': {
            prefix: 'collage-hope-events',
            count: 4,
            alt: (n) => `Snowdrop United hope event ${n}`,
        },
        // No hub event photos have been uploaded yet, so these sliders stay empty
        // and hide themselves instead of rendering broken images.
        'houston-slider': {
            prefix: 'houston-hub-event',
            count: 0,
            alt: (n) => `Houston Hub event ${n}`,
        },
        'austin-slider': {
            prefix: 'austin-hub-event',
            count: 0,
            alt: (n) => `Austin Hub event ${n}`,
        },
    };

    // ================= TEAM ROSTERS =================
    const rosters = {
        'directors-grid': {
            prefix: 'director',
            members: [
                { name: 'Alexis Prevette', title: 'President' },
                { name: 'Kishen Misra', title: 'Vice President' },
                { name: 'Quintin Fernandez', title: 'Treasurer' },
                { name: 'James L', title: 'Secretary' },
                { name: 'Kevin Phan', title: 'Director' },
                { name: 'Adam Vivas', title: 'Director' },
            ],
        },
        'houston-hub-grid': {
            prefix: 'houston-hub',
            members: [
                { name: 'Jay Mital', title: 'President' },
                { name: 'Awais Jaffer', title: 'Vice President' },
                { name: 'Rushil Vyas', title: 'Secretary' },
                { name: 'Zhijun Gong', title: 'Community Outreach Director' },
                { name: 'Mason Nguyen', title: 'Health and Safety Director' },
                { name: 'Daphne Seraphim', title: 'Marketing Director' },
                { name: 'Joseph Le', title: 'Fundraising Director' },
            ],
        },
        'austin-hub-grid': {
            prefix: 'austin-hub',
            members: [
                { name: 'Kishen Misra', title: 'President' },
                { name: 'Kevin Phan', title: 'Vice President' },
                { name: 'Ben Lansky', title: 'Financial Director' },
                { name: 'Zuhair Kazi', title: 'Partnerships Director' },
                { name: 'Giacomo Pietropaolo', title: 'Operations Director' },
                { name: 'Ryan Skinner', title: 'Growth Director' },
            ],
        },
    };

    // ================= IMAGE LOADING =================
    /**
     * Point an <img> at images/<base><ext>, walking through the extension
     * candidates on failure. Resolves true when a file loads, false when none do.
     *
     * An <img> error event carries no status code, so "file does not exist" and
     * "the connection dropped" are indistinguishable. Pages like about-us.html
     * request ~20 images at once, and under that burst a request can fail
     * transiently — so each URL is retried before we conclude the file is
     * missing. Without the retry, one hiccup permanently replaced a real
     * headshot with the placeholder until the page was reloaded from cache.
     */
    function resolveImage(img, base) {
        return new Promise((resolve) => {
            let extIndex = 0;
            let retriesLeft = IMAGE_RETRIES;

            const urlFor = (ext) => `images/${base}${ext}`;

            function finish(ok) {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                if (!ok) {
                    console.warn(`[snowdrop] no image found for "${base}" (tried ${IMAGE_EXTENSIONS.join(', ')})`);
                }
                resolve(ok);
            }

            function onLoad() {
                finish(true);
            }

            function onError() {
                if (retriesLeft > 0) {
                    retriesLeft--;
                    // Re-request the same file. The query string is only here to
                    // defeat the browser's negative cache for the failed request.
                    const attempt = IMAGE_RETRIES - retriesLeft;
                    setTimeout(() => {
                        img.src = `${urlFor(IMAGE_EXTENSIONS[extIndex])}?retry=${attempt}`;
                    }, RETRY_DELAY_MS);
                    return;
                }

                extIndex += 1;
                retriesLeft = IMAGE_RETRIES;
                if (extIndex >= IMAGE_EXTENSIONS.length) {
                    finish(false);
                    return;
                }
                img.src = urlFor(IMAGE_EXTENSIONS[extIndex]);
            }

            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            img.src = urlFor(IMAGE_EXTENSIONS[extIndex]);
        });
    }

    function buildSlides(trackId, set) {
        const track = document.getElementById(trackId);
        if (!track) return Promise.resolve();

        const pending = [];

        for (let i = 1; i <= set.count; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';

            const img = document.createElement('img');
            img.alt = set.alt ? set.alt(i) : `${set.prefix.replace(/-/g, ' ')} ${i}`;
            img.decoding = 'async';
            // Deliberately not lazy: the slider has to know which files exist
            // before it can lay itself out, and lazy images inside an
            // overflow:hidden track may never fire load/error.

            slide.appendChild(img);
            track.appendChild(slide);

            // Drop the slide entirely if no file exists — a hidden-but-present
            // slide throws off the track's translate math.
            pending.push(
                resolveImage(img, `${set.prefix}-${i}`).then((ok) => {
                    if (!ok) slide.remove();
                })
            );
        }

        return Promise.all(pending);
    }

    function buildRoster(gridId, roster) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        roster.members.forEach((member, idx) => {
            const card = document.createElement('div');
            card.className = 'director-card';

            const img = document.createElement('img');
            img.alt = `${member.name}, ${member.title}`;
            img.decoding = 'async';
            img.loading = 'lazy';

            const name = document.createElement('h3');
            name.textContent = member.name;

            const title = document.createElement('p');
            title.className = 'director-title';
            title.textContent = member.title;

            card.append(img, name, title);
            grid.appendChild(card);

            resolveImage(img, `${roster.prefix}-${idx + 1}`).then((ok) => {
                if (ok) return;
                // Keep the card (the person is still on the team) but show the
                // logo as a contained placeholder rather than a cropped fill.
                img.classList.add('is-placeholder');
                img.src = 'images/logo-primary.png';
                img.alt = `${member.name}, ${member.title} — photo coming soon`;
            });
        });
    }

    // ================= SLIDER =================
    function createSlider(container) {
        const track = container.querySelector('.slider-track');
        if (!track) return;

        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');

        let index = 0;
        let animating = false;
        let autoTimer = null;
        let settleTimer = null;
        let paused = false;
        let dots = [];
        let drag = null;          // live pointer-drag state, null when idle
        let suppressClick = false;

        const realSlides = () =>
            Array.from(track.children).filter((el) => el.dataset.clone !== '1');

        // offsetPx is the live finger/cursor offset during a drag; it is 0 for
        // every programmatic move.
        function setTransform(animate, offsetPx) {
            const shift = offsetPx || 0;
            track.style.transition = animate
                ? `transform ${SLIDE_MS}ms ${EASING}`
                : 'none';
            track.style.transform = shift
                ? `translateX(calc(${-index * 100}% + ${shift}px))`
                : `translateX(-${index * 100}%)`;
            if (!animate && !shift) {
                // Flush the jump so the next animated move actually transitions.
                // Skipped while dragging — a forced reflow per pointermove is a
                // cost with no benefit, since nothing transitions mid-drag.
                void track.offsetHeight;
            }
        }

        function syncDots() {
            if (!dots.length) return;
            const count = dots.length;
            const active = index % count;
            dots.forEach((dot, i) => {
                dot.classList.toggle('is-active', i === active);
                dot.setAttribute('aria-current', i === active ? 'true' : 'false');
            });
        }

        function goTo(target, animate) {
            index = target;
            setTransform(animate && !REDUCED_MOTION);
            syncDots();

            clearTimeout(settleTimer);
            if (animate && !REDUCED_MOTION) {
                animating = true;
                // transitionend does not fire in background tabs or when the
                // transform is unchanged — this guarantees we unlock.
                settleTimer = setTimeout(onSettled, SLIDE_MS + 120);
            } else {
                animating = false;
            }
        }

        function onSettled() {
            clearTimeout(settleTimer);
            animating = false;
            // Landed on the trailing clone: snap back to the real first slide.
            const last = track.children.length - 1;
            if (last > 0 && track.children[last]?.dataset.clone === '1' && index >= last) {
                index = 0;
                setTransform(false);
                syncDots();
            }
        }

        function next() {
            if (animating) return;
            if (realSlides().length < 2) return;
            goTo(index + 1, true);
        }

        function prev() {
            if (animating) return;
            const count = realSlides().length;
            if (count < 2) return;
            if (index === 0) {
                // Hop to the clone (visually identical to slide 1), then animate
                // backwards onto the real last slide.
                goTo(count, false);
                requestAnimationFrame(() => goTo(count - 1, true));
                return;
            }
            goTo(index - 1, true);
        }

        function stopAuto() {
            clearInterval(autoTimer);
            autoTimer = null;
        }

        function startAuto() {
            stopAuto();
            if (paused || REDUCED_MOTION) return;
            if (drag) return; // mouseleave fires mid-drag under pointer capture
            if (realSlides().length < 2) return;
            autoTimer = setInterval(() => {
                if (document.hidden) return;
                next();
            }, AUTOPLAY_MS);
        }

        function nudge(fn) {
            fn();
            startAuto(); // don't advance again immediately after a manual move
        }

        function buildDots(count) {
            const existing = container.querySelector('.slider-dots');
            if (existing) existing.remove();
            dots = [];
            if (count < 2) return;

            const nav = document.createElement('div');
            nav.className = 'slider-dots';

            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'slider-dot';
                dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${count}`);
                dot.addEventListener('click', () => {
                    if (animating || index === i) return;
                    nudge(() => goTo(i, true));
                });
                nav.appendChild(dot);
                dots.push(dot);
            }

            container.appendChild(nav);
        }

        function refresh() {
            stopAuto();
            clearTimeout(settleTimer);
            animating = false;

            track.querySelectorAll('[data-clone="1"]').forEach((el) => el.remove());
            const slides = realSlides();

            container.hidden = slides.length === 0;
            const multi = slides.length > 1;

            if (prevBtn) prevBtn.hidden = !multi;
            if (nextBtn) nextBtn.hidden = !multi;

            if (multi) {
                const clone = slides[0].cloneNode(true);
                clone.dataset.clone = '1';
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            }

            buildDots(slides.length);
            index = 0;
            setTransform(false);
            syncDots();
            startAuto();
        }

        track.addEventListener('transitionend', (e) => {
            if (e.target !== track || e.propertyName !== 'transform') return;
            onSettled();
        });

        if (nextBtn) nextBtn.addEventListener('click', () => nudge(next));
        if (prevBtn) prevBtn.addEventListener('click', () => nudge(prev));

        container.addEventListener('mouseenter', () => {
            paused = true;
            stopAuto();
        });
        container.addEventListener('mouseleave', () => {
            paused = false;
            startAuto();
        });
        container.addEventListener('focusin', () => {
            paused = true;
            stopAuto();
        });
        container.addEventListener('focusout', (e) => {
            if (container.contains(e.relatedTarget)) return;
            paused = false;
            startAuto();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAuto();
            else startAuto();
        });

        container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nudge(next);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                nudge(prev);
            }
        });

        // ---- Pointer drag (mouse, touch, pen) ----------------------------
        // Replaces the old touch-only swipe. One code path for every pointer
        // type, so desktop visitors can drag the carousel instead of hunting
        // for the arrows, and the track now follows the cursor 1:1 rather than
        // waiting for the gesture to end.
        const DRAG_VELOCITY = 0.11;  // px/ms — a flick, however short
        const DRAG_FRACTION = 0.18;  // of the container — a deliberate haul
        const RUBBER_BAND = 0.35;    // resistance past the first slide
        const DRAG_SLOP = 5;         // px before a press counts as a drag

        function containerWidth() {
            return container.clientWidth || track.clientWidth || 1;
        }

        track.addEventListener('pointerdown', (e) => {
            if (!e.isPrimary || e.button > 0) return;
            if (animating || realSlides().length < 2) return;

            drag = {
                id: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                lastX: e.clientX,
                lastT: e.timeStamp,
                vx: 0,
                moved: false,
                axis: null,
            };
            suppressClick = false;
            stopAuto();

            // Without this the browser's native image drag hijacks the gesture
            // and leaves a ghost thumbnail stuck to the cursor.
            if (e.pointerType === 'mouse') e.preventDefault();
        });

        track.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.id) return;

            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;

            // Decide the axis once. A vertical gesture belongs to the page, so
            // hand it back rather than scrubbing the track sideways.
            if (!drag.axis) {
                if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return;
                if (Math.abs(dy) > Math.abs(dx)) {
                    drag = null;
                    startAuto();
                    return;
                }
                drag.axis = 'x';
                track.setPointerCapture(e.pointerId);
                track.classList.add('is-dragging');
            }

            drag.moved = true;

            const dt = e.timeStamp - drag.lastT;
            if (dt > 0) drag.vx = (e.clientX - drag.lastX) / dt;
            drag.lastX = e.clientX;
            drag.lastT = e.timeStamp;

            // Nothing sits to the left of the first slide, so resist instead of
            // dragging empty track into view.
            const offset = index === 0 && dx > 0 ? dx * RUBBER_BAND : dx;
            setTransform(false, offset);
        });

        function endDrag(e) {
            if (!drag || e.pointerId !== drag.id) return;

            const d = drag;
            drag = null;
            track.classList.remove('is-dragging');
            if (track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
                track.releasePointerCapture(e.pointerId);
            }

            if (!d.moved) {
                startAuto();
                return;
            }

            suppressClick = true;

            const dx = e.clientX - d.startX;
            const commit =
                Math.abs(d.vx) > DRAG_VELOCITY ||
                Math.abs(dx) > containerWidth() * DRAG_FRACTION;

            if (commit && dx < 0) {
                nudge(next);
            } else if (commit && dx > 0 && index > 0) {
                nudge(prev);
            } else {
                // Snap back. Deliberately not routed through goTo(): leaving
                // `animating` false keeps the track re-grabbable immediately,
                // and a CSS transition retargets from wherever it currently is.
                track.style.transition = `transform ${SLIDE_MS}ms ${EASING}`;
                track.style.transform = `translateX(-${index * 100}%)`;
                startAuto();
            }
        }

        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);

        // A drag that happens to end over an image must not also read as a click.
        track.addEventListener(
            'click',
            (e) => {
                if (!suppressClick) return;
                suppressClick = false;
                e.preventDefault();
                e.stopPropagation();
            },
            true
        );

        container.setAttribute('role', 'group');
        container.setAttribute('aria-roledescription', 'carousel');

        refresh();
        return { refresh };
    }

    // ================= SCROLL REVEAL =================
    const REVEAL_SELECTOR = [
        '.section-title',
        '.stat-card',
        '.hub-card',
        '.director-card',
        '.job-card',
        '.merch-container > *',
        '.home-mission__body',
    ].join(', ');

    const REVEAL_MS = 300;      // matches --motion-snappy
    const REVEAL_STAGGER = 60;  // ms between siblings in the same group

    /**
     * Fade + lift elements as they scroll into view, in sibling order.
     *
     * The pre-reveal styles are added by JS, never by the stylesheet, so the
     * page renders fully visible if this script fails or never runs. Both
     * classes are stripped once an element lands, which also keeps the reveal's
     * `transform` from fighting the `:hover` lift these cards already have.
     */
    function initScrollReveal() {
        const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
        if (!targets.length || !('IntersectionObserver' in window)) return;

        // Stagger is per-parent: a grid of cards cascades, but a card in one
        // section doesn't wait on an unrelated section above it.
        const groupIndex = new Map();
        targets.forEach((el) => {
            const parent = el.parentElement;
            const n = groupIndex.get(parent) || 0;
            groupIndex.set(parent, n + 1);
            el.dataset.revealIndex = String(Math.min(n, 6)); // cap the wait
            el.classList.add('reveal');
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    observer.unobserve(el);

                    const delay = REDUCED_MOTION
                        ? 0
                        : Number(el.dataset.revealIndex) * REVEAL_STAGGER;

                    setTimeout(() => {
                        el.classList.add('is-revealed');
                        // Drop the reveal styles once it has landed so the
                        // element is back to its normal self.
                        setTimeout(() => {
                            el.classList.remove('reveal', 'is-revealed');
                            delete el.dataset.revealIndex;
                        }, REVEAL_MS + 60);
                    }, delay);
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        targets.forEach((el) => observer.observe(el));
    }

    // ================= STAT COUNT-UP =================
    /**
     * Count the impact numbers up from zero the first time they scroll into
     * view. The numbers are the whole point of that band, so watching them
     * climb is explanation rather than decoration — and it happens once.
     */
    function initStatCounters() {
        const nums = Array.from(document.querySelectorAll('.stat-number'));
        if (!nums.length || REDUCED_MOTION || !('IntersectionObserver' in window)) return;

        const COUNT_MS = 900;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    run(entry.target);
                });
            },
            { threshold: 0.5 }
        );

        function prepare() {
            nums.forEach((el) => {
                // "3,000+" -> prefix "", value 3000, suffix "+"
                const match = /^(\D*)([\d,]+)(.*)$/.exec(el.textContent.trim());
                if (!match) return;

                const value = Number(match[2].replace(/,/g, ''));
                if (!Number.isFinite(value) || value <= 0) return;

                const prefix = match[1];
                const suffix = match[3];

                el.dataset.countPrefix = prefix;
                el.dataset.countValue = String(value);
                el.dataset.countSuffix = suffix;

                // Pin the box to the final string's width before zeroing the
                // text. tabular-nums already fixes the digit widths; this stops
                // the shorter "0" from re-centering the whole line each frame.
                el.style.display = 'inline-block';
                el.style.minWidth = `${Math.ceil(el.getBoundingClientRect().width)}px`;
                el.textContent = `${prefix}0${suffix}`;

                observer.observe(el);
            });
        }

        // Measure against the real webfont, not the fallback — Work Sans loads
        // async, and pinning a fallback-metrics width would size the box wrong.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(prepare);
        } else {
            prepare();
        }

        function run(el) {
            const prefix = el.dataset.countPrefix || '';
            const suffix = el.dataset.countSuffix || '';
            const value = Number(el.dataset.countValue);
            const start = performance.now();

            function step(now) {
                const t = Math.min((now - start) / COUNT_MS, 1);
                // ease-out cubic: fast off the line, settling into the number
                const eased = 1 - Math.pow(1 - t, 3);
                const shown = Math.round(value * eased);
                el.textContent = prefix + shown.toLocaleString('en-US') + suffix;
                if (t < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }
    }

    // ================= INITIALIZE =================
    Object.entries(rosters).forEach(([gridId, roster]) => buildRoster(gridId, roster));

    initScrollReveal();
    initStatCounters();

    const sliderBuilds = Object.entries(sliderSets).map(([trackId, set]) =>
        buildSlides(trackId, set)
    );

    // Wait for the images to resolve (or fail) so the slider never counts a
    // slide that is about to be removed. Cap the wait so a stalled request
    // cannot leave the sliders dead.
    const allSettled = Promise.all(sliderBuilds);
    const ready = Promise.race([
        allSettled.then(() => 'settled'),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 4000)),
    ]);

    ready.then((how) => {
        const instances = [];
        document.querySelectorAll('.slider-container').forEach((container) => {
            const instance = createSlider(container);
            if (instance) instances.push(instance);
        });

        // Started early because an image stalled: re-measure once it lands.
        if (how === 'timeout') {
            allSettled.then(() => instances.forEach((instance) => instance.refresh()));
        }
    });
});
