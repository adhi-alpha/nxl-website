import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, Code, Smartphone, Cloud, Server, Gamepad2, Briefcase, Loader, Search, PenTool, Code2, Rocket, Facebook, Linkedin } from 'lucide-react';
import * as THREE from 'three';
// GSAP and ScrollTrigger are now loaded via a script loader to prevent import conflicts.

// Icon mapping to convert string names from the API to actual components
const ICONS = {
    Code, Smartphone, Cloud, Server, Gamepad2, Briefcase, Search, PenTool, Code2, Rocket
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // This effect now handles loading all external animation libraries.
    const loadScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = onLoad;
      document.body.appendChild(script);
      return script;
    };

    // Dynamically load the "Orbitron" font from Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Load GSAP, then ScrollTrigger, then fetch data
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', () => {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', () => {
        // Register ScrollTrigger plugin after both scripts are loaded
        if (window.gsap) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          setScriptsLoaded(true); // Mark scripts as loaded
        }
        // In App.jsx
        fetch(`${import.meta.env.VITE_API_URL}/api/data`)
          .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
          })     
          .then(data => {
            // Convert icon strings from API to React components
            if (data && data.services && data.process) {
                const processedData = {
                    ...data,
                    services: data.services.map(s => ({ ...s, icon: ICONS[s.icon] || Code })),
                    process: data.process.map(p => ({ ...p, icon: ICONS[p.icon] || Rocket }))
                };
                setSiteData(processedData);
            } else {
                throw new Error("Invalid data structure from API");
            }
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch or process site data:", err);
            setError("Failed to load content. Please try again later.");
            setIsLoading(false);
          });
      });
    });

  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  if (isLoading || !scriptsLoaded) {
    return (
      <div className="bg-gray-900 text-white font-sans min-h-screen flex flex-col justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ ease: "linear", duration: 1, repeat: Infinity }}
        >
          <Loader size={48} className="text-blue-500" />
        </motion.div>
        <p className="mt-4 text-lg">Loading Innovations...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="bg-gray-900 text-white font-sans min-h-screen flex flex-col justify-center items-center text-center p-4">
        <p className="text-red-500 text-xl mb-4">{error || "An unknown error occurred."}</p>
        <p className="text-gray-400">Please ensure the backend server is running on port 3001 and the CMS content is published.</p>
      </div>
    );
  }

  const renderPage = () => {
    const pageId = currentPage.startsWith('service-') ? 'service-detail' : currentPage;
    switch (pageId) {
      case 'home':
        return <HomePage navigateTo={navigateTo} data={siteData} />;
      case 'about':
        return <AboutPage data={siteData.about} />;
      case 'services':
        return <ServicesPage navigateTo={navigateTo} services={siteData.services} />;
      case 'service-detail':
        const serviceId = currentPage.split('-')[1];
        const service = siteData.services.find(s => s.id === serviceId);
        return <ServiceDetailPage service={service} contact={siteData.contact} />;
      case 'careers':
        return <CareersPage data={siteData.careers} />;
      case 'contact':
        return <ContactPage data={siteData.contact} />;
      default:
        return <HomePage navigateTo={navigateTo} data={siteData} />;
    }
  };

  return (
    <div className="bg-gray-900 font-sans text-white">
      <Header navigateTo={navigateTo} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <Footer navigateTo={navigateTo} data={siteData} />
    </div>
  );
}

// Header Component
const Header = ({ navigateTo, isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'careers', label: 'Careers' },
    { id: 'contact', label: 'Contact' },
  ];
  
  const glowAnimation = {
    textShadow: [
      "0 0 8px rgba(94, 114, 228, 0.8), 0 0 16px rgba(137, 101, 224, 0.8)",
      "0 0 16px rgba(94, 114, 228, 1), 0 0 32px rgba(137, 101, 224, 1)",
      "0 0 8px rgba(94, 114, 228, 0.8), 0 0 16px rgba(137, 101, 224, 0.8)",
    ],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isScrolled ? 'bg-gray-900 bg-opacity-80 backdrop-blur-md' : 'bg-transparent'}`} style={{fontFamily: "'Orbitron', sans-serif"}}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="text-3xl font-bold tracking-wider cursor-pointer"
          onClick={() => navigateTo('home')}
          whileHover={{ scale: 1.05 }}
          animate={glowAnimation}
        >
          NXL<span className="text-blue-400">.</span>
        </motion.div>
        <nav className="hidden md:flex space-x-8 items-center">
          {navItems.map(item => (
            <motion.button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className="text-gray-300 transition-colors duration-300 font-bold"
              whileHover={{ y: -2, color: '#ffffff' }}
              animate={glowAnimation}
            >
              {item.label}
            </motion.button>
          ))}
          <motion.button 
            onClick={() => navigateTo('contact')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.5)" }}
          >
            Get In Touch
          </motion.button>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-800"
          >
            <nav className="flex flex-col items-center py-4 space-y-4">
              {navItems.map(item => (
                <motion.button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-lg font-bold"
                  animate={glowAnimation}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button 
                onClick={() => navigateTo('contact')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 w-4/5"
                whileHover={{ scale: 1.05 }}
              >
                Get In Touch
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Footer Component
const Footer = ({ navigateTo, data }) => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">NXL<span className="text-blue-400">.</span></h3>
            <p className="text-gray-400 mb-6">{data.hero.subtitle.substring(0, 100)}...</p>
            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/NXL-Technologies/61567502310449/?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
              <a href="https://www.linkedin.com/company/nxl-technologies/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul>
              <li className="mb-2"><button onClick={() => navigateTo('about')} className="text-gray-400 hover:text-white">About Us</button></li>
              <li className="mb-2"><button onClick={() => navigateTo('services')} className="text-gray-400 hover:text-white">Services</button></li>
              <li className="mb-2"><button onClick={() => navigateTo('careers')} className="text-gray-400 hover:text-white">Careers</button></li>
              <li className="mb-2"><button onClick={() => navigateTo('contact')} className="text-gray-400 hover:text-white">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-gray-400 mb-2">{data.contact.phone}</p>
            <p className="text-gray-400 mb-2">{data.contact.email}</p>
            {data.contact.addresses.map(addr => (
              <p key={addr.city} className="text-gray-400 mt-2"><strong>{addr.city}:</strong> {addr.details}</p>
            ))}
          </div>
           <div>
            <h4 className="text-lg font-semibold mb-4">Have a Project?</h4>
            <p className="text-gray-400 mb-4">We'd love to discuss how we can assist you.</p>
             <motion.button 
                onClick={() => navigateTo('contact')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 w-full"
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.5)" }}
              >
                Let's Talk
              </motion.button>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} NXL Technologies. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Home Page Component
const HomePage = ({ navigateTo, data }) => {
  return (
    <>
      <HeroSection navigateTo={navigateTo} heroData={data.hero} />
      <WhatWeDoSection navigateTo={navigateTo} services={data.services} />
      <HowWeHelpSection />
      <ProcessSection processData={data.process} />
    </>
  );
};

// Advanced Three.js Particle Animation Component
const ThreeDAnimation = () => {
    const mountRef = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const currentMount = mountRef.current; // Capture mount point

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 3;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        const particleCount = 10000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const color1 = new THREE.Color("#5e72e4");
        const color2 = new THREE.Color("#8965e0");

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = Math.random() * 2 + 1;
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            const mixedColor = color1.clone().lerp(color2, (positions[i3 + 1] + 1.5) / 3);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.015, // Particle size reduced from 0.025
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        const originalPositions = new Float32Array(positions);

        const handleMouseMove = (event) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        
        const handleResize = () => {
            if (currentMount) {
                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        };
        window.addEventListener('resize', handleResize);

        const clock = new THREE.Clock();
        let animationFrameId;
        
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const x = geometry.attributes.position.getX(i);
                const y = geometry.attributes.position.getY(i);
                const waveX = Math.sin(elapsedTime * 0.5 + x * 0.5) * 0.1;
                const waveY = Math.cos(elapsedTime * 0.5 + y * 0.5) * 0.1;
                const mouseVector = new THREE.Vector2(mouse.current.x * 2, mouse.current.y * 2);
                const particleVector = new THREE.Vector2(x, y);
                const dist = mouseVector.distanceTo(particleVector);
                const force = Math.max(0, 1 - dist * 2);
                const angle = mouseVector.sub(particleVector).angle();
                const pushX = Math.cos(angle) * force * -0.2;
                const pushY = Math.sin(angle) * force * -0.2;
                geometry.attributes.position.setX(i, THREE.MathUtils.lerp(x, originalPositions[i3] + waveX + pushX, 0.1));
                geometry.attributes.position.setY(i, THREE.MathUtils.lerp(y, originalPositions[i3 + 1] + waveY + pushY, 0.1));
            }
            geometry.attributes.position.needsUpdate = true;
            particles.rotation.y = elapsedTime * 0.05;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};


// Hero Section
const HeroSection = ({ navigateTo, heroData }) => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-grid-gray-700/[0.2] relative pt-24 md:pt-0 overflow-hidden">
       <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
       <ThreeDAnimation />
      <div className="container mx-auto px-6 text-center z-10">
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {heroData.tagline}
        </motion.h1>
        <motion.p 
          className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {heroData.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={() => navigateTo('services')}
            className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Our Services <ArrowRight className="inline ml-2" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// What We Do Section
const WhatWeDoSection = ({ navigateTo, services }) => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Do</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Elevate Your Craft With Our Suggestion</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex-grow">
                <div className="flex items-center mb-4">
                  <service.icon className="text-blue-400 mr-4" size={32} />
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>
                <p className="text-gray-400 mb-6">{service.description}</p>
              </div>
              <button
                onClick={() => navigateTo(`service-${service.id}`)}
                className="text-blue-400 hover:text-blue-300 font-semibold mt-auto flex items-center"
              >
                Learn More <ArrowRight className="inline ml-2" size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How We Help Section
const HowWeHelpSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How NXL Technologies Helps You</h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">Experience the Power of Tailored IT Solutions. We bring innovation and efficiency to your business operations. Let’s transform your ideas into reality with state-of-the-art technology solutions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="p-8 bg-gray-800 rounded-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
                <h3 className="text-3xl font-bold mb-4 text-blue-400">Cloud Solutions</h3>
                <p className="text-gray-300 text-lg">Empower your business with scalable and secure cloud infrastructure, enabling flexibility and growth.</p>
            </motion.div>
            <motion.div 
              className="p-8 bg-gray-800 rounded-xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h3 className="text-3xl font-bold mb-4 text-purple-400">Software Development</h3>
                <p className="text-gray-300 text-lg">Custom applications designed to elevate your business performance and streamline operations.</p>
            </motion.div>
        </div>
      </div>
    </section>
  );
};

// GSAP Scrollytelling Section
const ProcessSection = ({ processData }) => {
    const mainRef = useRef(null);
    const panelsContainerRef = useRef(null);

    useEffect(() => {
        // Guard against GSAP not being loaded yet
        if (!window.gsap || !window.gsap.utils) {
            return;
        }

        // Using gsap.context() is the modern, professional way to handle GSAP in React.
        // It automatically handles cleanup of all animations and ScrollTriggers created within it.
        const ctx = window.gsap.context(() => {
            const panels = window.gsap.utils.toArray(".step-panel");
            if (!panels.length) return;

            window.gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: mainRef.current,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (panels.length - 1),
                    end: () => "+=" + (panelsContainerRef.current.offsetWidth - window.innerWidth),
                },
            });
        }, mainRef); // Scoping the context to the main container

        return () => ctx.revert(); // Cleanup function
    }, [processData]); // Rerun the effect if the process data changes

    return (
        <section ref={mainRef} className="relative w-full overflow-x-hidden">
            <div className="py-12 bg-gray-900 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Proven Process</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">We follow a structured approach to ensure quality and success in every project.</p>
            </div>
            <div ref={panelsContainerRef} className="flex" style={{ width: `${processData.length * 100}vw`, height: '80vh' }}>
                {processData.map((step) => (
                    <div key={step.id} className="step-panel h-full w-screen flex-shrink-0 flex items-center justify-center">
                        <div className="container mx-auto px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div className="text-center md:text-left">
                                    <step.icon className="text-blue-400 mx-auto md:mx-0 mb-6" size={64} />
                                    <h3 className="text-4xl md:text-5xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-lg text-gray-300 max-w-md mx-auto md:mx-0">{step.description}</p>
                                </div>
                                <div className="hidden md:flex justify-center items-center text-9xl font-extrabold text-gray-800 text-center select-none">
                                    0{step.id}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};


// Generic Page Wrapper
const PageWrapper = ({ title, children }) => (
  <div className="pt-28 pb-16 min-h-screen">
    <div className="container mx-auto px-6">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h1>
      {children}
    </div>
  </div>
);

// About Page
const AboutPage = ({ data }) => {
  return (
    <PageWrapper title="About NXL Technologies">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold mb-6">{data.title}</h2>
          <p className="text-gray-300 leading-relaxed">{data.content}</p>
        </motion.div>
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-3xl font-bold text-center mb-8">Our Core Values</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {data.values.map((value, index) => (
              <motion.div
                key={value}
                className="bg-gray-700 py-2 px-5 rounded-full text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

// Services Page
const ServicesPage = ({ navigateTo, services }) => {
  return (
    <PageWrapper title="Our Services">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col cursor-pointer"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => navigateTo(`service-${service.id}`)}
            whileHover={{ y: -5 }}
          >
            <div className="flex-grow">
              <div className="flex items-center mb-4">
                <service.icon className="text-blue-400 mr-4" size={32} />
                <h3 className="text-2xl font-bold">{service.title}</h3>
              </div>
              <p className="text-gray-400 mb-6">{service.description}</p>
            </div>
            <span className="text-blue-400 hover:text-blue-300 font-semibold mt-auto flex items-center">
              View Details <ArrowRight className="inline ml-2" size={16} />
            </span>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

// Service Detail Page
const ServiceDetailPage = ({ service, contact }) => {
  if (!service) return <PageWrapper title="Service Not Found" />;

  return (
    <PageWrapper title={service.title}>
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl">
        <div className="flex items-center mb-8">
          <service.icon className="text-blue-400 mr-6" size={48} />
          <p className="text-xl text-gray-300 leading-relaxed">{service.details}</p>
        </div>
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-6">Key Offerings</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.list.map((item, index) => (
              <motion.li 
                key={index} 
                className="flex items-center text-gray-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <ArrowRight className="text-blue-400 mr-3 flex-shrink-0" size={16} />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
         <div className="mt-12 text-center bg-gray-700/50 p-6 rounded-lg">
             <h4 className="text-xl font-semibold mb-2">Need Assistance?</h4>
             <p className="text-gray-400 mb-4">Reach out to us today to discuss how we can support your business in achieving its digital goals!</p>
             <a href={`tel:${contact.phone}`} className="text-2xl font-bold text-blue-400 hover:underline">{contact.phone}</a>
         </div>
      </div>
    </PageWrapper>
  );
};

// Careers Page
const CareersPage = ({ data }) => {
  return (
    <PageWrapper title="Join Our Team!">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p 
          className="text-lg text-gray-300 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {data.intro}
        </motion.p>
        <motion.div
          className="bg-gray-800 p-8 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-4">How to Apply</h3>
          <p className="text-gray-400 mb-6">If you're excited to join our team, please send your updated CV along with a cover letter to the following email address:</p>
          <a 
            href={`mailto:${data.email}`}
            className="text-2xl font-bold text-blue-400 hover:underline break-all"
          >
            {data.email}
          </a>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

// Contact Page
const ContactPage = ({ data }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setIsSubmitted(true);
            setSubmitStatus({ success: true, message: result.message });
        } else {
            throw new Error(result.message || 'An unknown error occurred.');
        }
    } catch (error) {
        setIsSubmitting(false);
        setSubmitStatus({ success: false, message: error.message });
        console.error('Submission Error:', error);
    }
  };

  return (
    <PageWrapper title="Get In Touch">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold mb-4">Have a Project Plan?</h2>
          <p className="text-gray-300 mb-8">We believe that collaboration is key. We listen carefully to your goals and vision to craft custom solutions that drive growth and deliver results.</p>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-400">Mail us 24/7</h3>
              <a href={`mailto:${data.email}`} className="text-gray-300 hover:underline">{data.email}</a>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-400">Phone</h3>
              <a href={`tel:${data.phone}`} className="text-gray-300 hover:underline">{data.phone}</a>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-400">Address</h3>
              {data.addresses.map(addr => (
                <p key={addr.city} className="text-gray-300 mt-1"><strong>{addr.city}:</strong> {addr.details}</p>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {isSubmitted ? (
             <div className="bg-gray-800 p-8 rounded-xl h-full flex flex-col justify-center items-center text-center">
                 <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
                 <p className="text-gray-300">{submitStatus?.message || "Your message has been sent."}</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-xl">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"/>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">How can we help you?</label>
                <textarea name="message" id="message" rows="4" required value={formData.message} onChange={handleChange} className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {submitStatus && !submitStatus.success && (
                <p className="text-red-500 text-sm mt-2">{submitStatus.message}</p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
};