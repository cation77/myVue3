const toggleTheme = (event: MouseEvent) => {
  const transition = document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });

  const x = event.clientX;
  const y = event.clientY;

  const tragetRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${tragetRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 1000,
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
};

export default toggleTheme;
