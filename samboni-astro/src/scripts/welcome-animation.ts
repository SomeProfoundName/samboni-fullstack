import gsap from 'gsap';

// Split text into characters
function splitTextIntoChars(element: HTMLElement): HTMLSpanElement[] {
	const text = element.textContent || '';
	element.textContent = '';

	const chars: HTMLSpanElement[] = [];

	for (const char of text) {
		const span = document.createElement('span');
		span.textContent = char;
		span.style.display = 'inline-block';
		// Preserve spaces
		if (char === ' ') {
			span.style.width = '0.3em';
		}
		element.appendChild(span);
		chars.push(span);
	}

	return chars;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
	// Get all h1 elements (mobile and desktop)
	const h1Elements = document.querySelectorAll<HTMLElement>('#welcome-container h1');
	const h2Elements = document.querySelectorAll<HTMLElement>('#welcome-container h2');
	const imgElements = document.querySelectorAll<HTMLElement>('#welcome-container img');

	// Set initial states
	h2Elements.forEach(h2 => {
		gsap.set(h2, { opacity: 0, y: 30 });
	});

	// Set initial state for images - hidden and ready for peel effect
	imgElements.forEach(img => {
		gsap.set(img, {
			opacity: 0,
			scale: 0.3,
			rotateY: -80,
			rotateZ: -20,
			transformOrigin: 'left center',
			transformPerspective: 1000
		});
	});

	// Create main timeline
	const mainTl = gsap.timeline({ delay: 0.2 });

	// Process each h1 and create animation
	h1Elements.forEach((h1, index) => {
		const chars = splitTextIntoChars(h1);

		// Set initial state for characters
		gsap.set(chars, { opacity: 0, y: 50, rotateX: -90 });

		// Animate characters in with stagger
		mainTl.to(chars, {
			opacity: 1,
			y: 0,
			rotateX: 0,
			duration: 0.6,
			stagger: 0.05,
			ease: 'back.out(1.7)'
		}, index === 0 ? 0 : '<'); // Mobile and desktop h1 animate together

		// Animate corresponding h2 floating up
		const correspondingH2 = h2Elements[index];
		if (correspondingH2 && index === 0) {
			mainTl.to(h2Elements, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power2.out'
			}, '-=0.2');
		}
	});

	// Animate images with sticker peel effect
	mainTl.to(imgElements, {
		opacity: 1,
		scale: 1,
		rotateY: 0,
		rotateZ: (index, target) => {
			// Get the original rotation from classes
			const classes = target.className;
			if (classes.includes('-rotate-9')) return -9;
			if (classes.includes('-rotate-6')) return -6;
			if (classes.includes('rotate-5')) return 5;
			if (classes.includes('rotate-3')) return 3;
			return 0;
		},
		duration: 0.7,
		stagger: {
			each: 0.1,
			from: 'random'
		},
		ease: 'back.out(1.4)'
	}, '-=0.3');
});
