	import gsap from 'gsap';

	const slider = document.getElementById('slider');
	const goToAbout = document.getElementById('go-to-about');
	const goToWelcome = document.getElementById('go-to-welcome');

	let currentSlide = 0;

	goToAbout?.addEventListener('click', () => {
		if (currentSlide === 0) {
			gsap.to(slider, {
				x: '-100vw',
				duration: 0.8,
				ease: 'power2.inOut'
			});
			currentSlide = 1;
		}
	});

	goToWelcome?.addEventListener('click', () => {
		if (currentSlide === 1) {
			gsap.to(slider, {
				x: '0vw',
				duration: 0.8,
				ease: 'power2.inOut'
			});
			currentSlide = 0;
		}
	});