import { useEffect, useState, useRef } from 'react';
import video1 from '../assets/video3actualizado.mp4';
import video2 from '../assets/video1.mp4';
import video3 from '../assets/video2.mp4';
import './sliderVideo.css';

export default function VideoSlider() {
    const [currentVideo, setCurrentVideo] = useState(0);
    const videoRefs = useRef([]);
    const videos = [
        { url: video1, title: "SOGAL SOL", description: "Experiencias de lujo inigualables" },
        { url: video2, title: "SEGUNDO TITULO DECORATIVO", description: "Donde el confort se encuentra con la elegancia" },
        { url: video3, title: "Cabañas para motelear", description: "Tu escape premium perfecto" }
    ];

    useEffect(() => {
        // Pausar todos los videos primero
        videoRefs.current.forEach(video => {
            if (video) video.pause();
        });
        
        // Manejar el video actual
        const currentVideoRef = videoRefs.current[currentVideo];
        if (currentVideoRef) {
            currentVideoRef.currentTime = 0;
            currentVideoRef.play().catch(e => console.log("Autoplay prevented:", e));
        }
    
        const interval = setInterval(() => {
            setCurrentVideo(prev => (prev === videos.length - 1 ? 0 : prev + 1));
        }, 5000);
    
        return () => clearInterval(interval);
    }, [currentVideo]);
    
    const handleVideoEnd = () => {
        const currentVideoRef = videoRefs.current[currentVideo];
        if (currentVideoRef) {
            currentVideoRef.currentTime = 0;
            currentVideoRef.play();
        }
    };

    return (
        <div className="luxury-video-slider">
            {videos.map((video, index) => (
                <div
                    key={index}
                    className={`video-wrapper ${currentVideo === index ? 'active' : ''}`}
                >
                    <video
                        ref={el => (videoRefs.current[index] = el)}
                        className="video-element"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                    >
                        <source src={video.url} type="video/mp4" />
                    </video>
                </div>
            ))}

            <div className="luxury-overlay" />

            <div className="luxury-content">
                <h1 className="luxury-title">
                    <span className="title-part">{videos[currentVideo].title}</span>
                </h1>
                <p className="luxury-description">
                    {videos[currentVideo].description}
                </p>


            </div>
        </div>
    );
}