import { useEffect, useState } from 'react';
import video1 from '../assets/video3actualizado.mp4';
import video2 from '../assets/video1.mp4';
import video3 from '../assets/video2.mp4';
import './sliderVideo.css';

export default function Videoslider() {
    const [currentVideo, setCurrentVideo] = useState(0);
    const videos = [
        { url: video1 },
        { url: video2 },
        { url: video3 }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideo((prevVideo) => (prevVideo === videos.length - 1 ? 0 : prevVideo + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="video-slider">
            {videos.map((video, index) => (
                <div
                    key={index} 
                    className={`video-wrapper transition-slide ${currentVideo === index ? 'opacity-full' : 'opacity-zero'}`}
                >
                    <video 
                        className="video-element"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src={video.url} type="video/mp4" />
                    </video>
                </div>
            ))}

            <div className="overlay" />

            <div className="content-container">
                <h1 className="slider-title">SOGAL SOL</h1>
                <p className="slider-description">
                    Pendiente de una frase 
                </p>
            </div>
        </div>
    );
}
