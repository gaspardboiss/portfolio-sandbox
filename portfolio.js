/**
 * portfolio.js
 * Gaspard Boissinot — Portfolio audiovisuel
 *
 * Toutes les modales (photo et vidéo) partagent les mêmes fonctions génériques.
 * Chaque modale est identifiée par un slug : 'films', 'portraits', 'nb', etc.
 */

/* =====================================================
   Configuration des modales
   Déclare ici quelles galeries internes existent
   pour chaque modale vidéo (afin de les masquer/afficher).
===================================================== */
const VIDEO_MODALS = {
	films: ['gallery-films', 'gallery-films-lycee'],
	montages: ['gallery-montages-main', 'gallery-montages-drone', 'gallery-montages-game']
};

/* =====================================================
   Utilitaires
===================================================== */

/** Récupère un élément par id, sans planter si absent. */
function el(id) {
	return document.getElementById(id);
}

/** Applique un délai d'animation progressif aux vignettes d'une galerie. */
function animateThumbnails(galleryId) {
	const gallery = el(galleryId);
	if (!gallery) return;
	gallery.querySelectorAll('.thumbnail').forEach((thumb, i) => {
		thumb.style.animationDelay = (0.05 + i * 0.06) + 's';
	});
}

/* =====================================================
   Modales photo
===================================================== */

/**
 * Ouvre une modale (photo ou vidéo).
 * @param {string} slug - identifiant de la modale
 */
function openModal(slug) {
	const modal = el('modal-' + slug);
	if (!modal) return;
	modal.style.display = 'flex';
	document.body.classList.add('modal-open');

	// Anime les vignettes au premier affichage
	animateThumbnails('gallery-' + slug);

	// Pour les modales vidéo multi-galeries
	if (VIDEO_MODALS[slug]) {
		VIDEO_MODALS[slug].forEach(id => animateThumbnails(id));
	}
}

/**
 * Ferme une modale et remet l'état initial.
 * @param {string} slug
 */
function closeModal(slug) {
	const modal = el('modal-' + slug);
	if (!modal) return;
	modal.style.display = 'none';
	document.body.classList.remove('modal-open');
	backToGallery(slug);
}

/**
 * Affiche une photo en grand.
 * @param {string} slug
 * @param {string} src - chemin de l'image
 */
function showPhoto(slug, src) {
	const gallery = el('gallery-' + slug);
	const largeView = el('large-' + slug);
	const img = el('img-' + slug);
	if (!gallery || !largeView || !img) return;

	img.src = src;
	gallery.style.display = 'none';
	largeView.style.display = 'flex';
}

/* =====================================================
   Modales vidéo
===================================================== */

/**
 * Affiche une vidéo YouTube en grand dans la modale.
 * @param {string} slug
 * @param {string} url - URL d'embed YouTube
 */
function showVideo(slug, url) {
	// Masquer toutes les galeries de cette modale
	const galleries = VIDEO_MODALS[slug] || ['gallery-' + slug];
	galleries.forEach(id => {
		const g = el(id);
		if (g) g.style.display = 'none';
	});

	// Masquer les séparateurs internes à la modale
	const modal = el('modal-' + slug);
	if (modal) {
		modal.querySelectorAll('.modal-separator').forEach(sep => sep.style.display = 'none');
	}

	// Afficher le lecteur
	const player = el('video-' + slug);
	const iframe = el('iframe-' + slug);
	if (!player || !iframe) return;

	iframe.src = url + '?autoplay=1&rel=0';
	player.style.display = 'flex';
}

/* =====================================================
   Retour à la galerie (photo et vidéo)
===================================================== */

/**
 * Retourne à la vue galerie depuis la vue agrandie.
 * Fonctionne pour les photos et les vidéos.
 * @param {string} slug
 */
function backToGallery(slug) {
	// Vue photo
	const largeView = el('large-' + slug);
	if (largeView) {
		largeView.style.display = 'none';
		const img = el('img-' + slug);
		if (img) img.src = '';
	}

	// Vue vidéo
	const player = el('video-' + slug);
	const iframe = el('iframe-' + slug);
	if (player) {
		player.style.display = 'none';
		if (iframe) iframe.src = '';
	}

	// Réafficher toutes les galeries
	const galleries = VIDEO_MODALS[slug] || ['gallery-' + slug];
	galleries.forEach(id => {
		const g = el(id);
		if (g) g.style.display = 'block';
	});

	// Galerie photo simple
	const gallery = el('gallery-' + slug);
	if (gallery) gallery.style.display = 'block';

	// Réafficher les séparateurs
	const modal = el('modal-' + slug);
	if (modal) {
		modal.querySelectorAll('.modal-separator').forEach(sep => sep.style.display = 'flex');
	}
}

/* =====================================================
   Fermeture au clic en dehors de la modale
===================================================== */
document.addEventListener('click', function (e) {
	if (e.target.classList.contains('modal')) {
		// Récupère le slug depuis l'id "modal-{slug}"
		const id = e.target.id;
		if (id && id.startsWith('modal-')) {
			closeModal(id.slice(6));
		}
	}
});

/* =====================================================
   Fermeture au clavier (Échap)
===================================================== */
document.addEventListener('keydown', function (e) {
	if (e.key !== 'Escape') return;
	document.querySelectorAll('.modal').forEach(modal => {
		if (modal.style.display === 'flex') {
			const slug = modal.id.startsWith('modal-') ? modal.id.slice(6) : null;
			if (slug) closeModal(slug);
		}
	});
});

/* =====================================================
   Formulaire de contact (Formspree async)
===================================================== */
const contactForm = el('contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		const submitBtn = this.querySelector('[type="submit"]');
		submitBtn.disabled = true;
		submitBtn.value = 'Envoi en cours…';

		try {
			const response = await fetch(this.action, {
				method: 'POST',
				body: new FormData(this),
				headers: { Accept: 'application/json' }
			});

			if (response.ok) {
				alert('Message envoyé avec succès !');
				this.reset();
			} else {
				alert('Une erreur est survenue. Merci de réessayer.');
			}
		} catch {
			alert('Impossible d\'envoyer le message. Vérifiez votre connexion.');
		} finally {
			submitBtn.disabled = false;
			submitBtn.value = 'Envoyer un message';
		}
	});
}
