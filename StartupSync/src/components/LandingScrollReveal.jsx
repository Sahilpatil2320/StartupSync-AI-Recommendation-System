import { useEffect } from "react";
import "./LandingScrollReveal.css";

/**
 * Adds reveal-on-scroll behavior only to the public landing page.
 * The observer disconnects when the component unmounts.
 */
export default function LandingScrollReveal({ children }) {
  useEffect(() => {
    const page = document.querySelector(".landing-page");
    if (!page) return;

    const targets = page.querySelectorAll(
      ".platform-features, .platform-workflow, .startup-ecosystem, .ai-recommendation-showcase, .get-started-section, .site-footer"
    );

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -55px 0px" }
    );

    targets.forEach((target) => {
      target.classList.add("reveal-on-scroll");
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  return <div className="landing-page">{children}</div>;
}