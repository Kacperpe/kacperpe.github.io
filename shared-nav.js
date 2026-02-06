// Shared navigation/menu behavior for all pages
(function(){
	// ...safe init so it can be included multiple times...
	function initNavigationMenus() {
		// Toggle menu content on button click and handle keyboard
		document.querySelectorAll('.navigation-menu').forEach(menu => {
			const btn = menu.querySelector('.menu-button');
			const content = menu.querySelector('.menu-content');
			if (!btn || !content) return;

			// ensure accessible focus
			btn.setAttribute('aria-expanded', content.classList.contains('active') ? 'true' : 'false');
			btn.setAttribute('aria-controls', content.id || '');

			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const open = content.classList.toggle('active');
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
			btn.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					btn.click();
				}
			});
		});

		// Close any open menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.navigation-menu')) {
				document.querySelectorAll('.navigation-menu .menu-content.active').forEach(c => c.classList.remove('active'));
				document.querySelectorAll('.navigation-menu .menu-button').forEach(b => b.setAttribute('aria-expanded', 'false'));
			}
		});

		// Close menus on Escape
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				document.querySelectorAll('.navigation-menu .menu-content.active').forEach(c => c.classList.remove('active'));
				document.querySelectorAll('.navigation-menu .menu-button').forEach(b => b.setAttribute('aria-expanded', 'false'));
			}
		});

		// Highlight current page link (by filename)
		try {
			const current = decodeURIComponent(location.pathname.split('/').pop() || 'index.html').toLowerCase();
			document.querySelectorAll('.navigation-menu .menu-content a').forEach(a => {
				const href = decodeURIComponent((a.getAttribute('href') || '').split('/').pop() || '');
				if (href && href.toLowerCase() === current) {
					a.style.fontWeight = '700';
					a.setAttribute('aria-current', 'page');
				}
			});
		} catch (e) {
			/* ignore */
		}
	}

	// init on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initNavigationMenus);
	} else {
		initNavigationMenus();
	}

	// expose for dynamic pages
	window.initNavigationMenus = initNavigationMenus;
})();
