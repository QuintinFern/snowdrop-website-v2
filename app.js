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

        const realSlides = () =>
            Array.from(track.children).filter((el) => el.dataset.clone !== '1');

        function setTransform(animate) {
            track.style.transition = animate
                ? `transform ${SLIDE_MS}ms ${EASING}`
                : 'none';
            track.style.transform = `translateX(-${index * 100}%)`;
            if (!animate) {
                // Flush the jump so the next animated move actually transitions.
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

        // Swipe on touch devices
        let touchStartX = null;
        track.addEventListener(
            'touchstart',
            (e) => {
                touchStartX = e.changedTouches[0].clientX;
                stopAuto();
            },
            { passive: true }
        );
        track.addEventListener(
            'touchend',
            (e) => {
                if (touchStartX === null) return;
                const delta = e.changedTouches[0].clientX - touchStartX;
                touchStartX = null;
                if (Math.abs(delta) > 45) nudge(delta < 0 ? next : prev);
                else startAuto();
            },
            { passive: true }
        );

        container.setAttribute('role', 'group');
        container.setAttribute('aria-roledescription', 'carousel');

        refresh();
        return { refresh };
    }

    // ================= INITIALIZE =================
    Object.entries(rosters).forEach(([gridId, roster]) => buildRoster(gridId, roster));

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
