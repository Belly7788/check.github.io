import React, { useEffect, useState } from "react";
import './style.css';

export function Background() {
    const [isDay, setIsDay] = useState(true);

    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            setIsDay(hour >= 6 && hour < 18); // Day: 6 AM - 6 PM, Night: 6 PM - 6 AM
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 perspective-1000">
            <div className={`absolute inset-0 overflow-hidden ${isDay ? 'bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700' : 'bg-gradient-to-b from-gray-900 via-indigo-900 to-black'}`}>

                {isDay ? (
                    <>
                        {/* Sun */}
                        <div className="absolute top-10 right-20 w-24 h-24 bg-yellow-200 rounded-full shadow-2xl shadow-yellow-400/50 transform translate-z-10">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-500 animate-pulse"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-200/50 to-transparent"></div>
                        </div>

                        {/* Clouds */}
                        <div className="absolute top-20 left-8 w-56 h-24 opacity-95 animate-cloud1 transform translate-z-20">
                            <div className="absolute top-0 left-0 w-24 h-20 bg-gradient-to-b from-white/95 to-gray-200/80 rounded-[45%] shadow-lg filter blur-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-10 w-28 h-18 bg-gradient-to-b from-white/90 to-gray-100/75 rounded-[40%] shadow-md filter blur-md transform translate-z-10"></div>
                            <div className="absolute top-6 left-20 w-20 h-16 bg-gradient-to-b from-white/85 to-gray-200/70 rounded-[50%] shadow-sm filter blur-md transform translate-z-15"></div>
                            <div className="absolute top-0 left-8 w-16 h-12 bg-white/40 rounded-full filter blur-lg transform translate-z-20"></div>
                        </div>
                        <div className="absolute top-36 right-32 w-72 h-28 opacity-90 animate-cloud2 transform translate-z-25">
                            <div className="absolute top-0 left-0 w-28 h-24 bg-gradient-to-b from-white/95 to-gray-200/80 rounded-[45%] shadow-lg filter blur-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-16 w-36 h-22 bg-gradient-to-b from-white/90 to-gray-100/75 rounded-[40%] shadow-md filter blur-md transform translate-z-10"></div>
                            <div className="absolute top-6 left-28 w-24 h-20 bg-gradient-to-b from-white/85 to-gray-200/70 rounded-[50%] shadow-sm filter blur-md transform translate-z-15"></div>
                            <div className="absolute top-0 left-20 w-20 h-14 bg-white/40 rounded-full filter blur-lg transform translate-z-20"></div>
                        </div>
                        <div className="absolute top-10 left-1/4 w-64 h-26 opacity-90 animate-cloud3 transform translate-z-15">
                            <div className="absolute top-0 left-0 w-28 h-22 bg-gradient-to-b from-white/95 to-gray-200/80 rounded-[45%] shadow-lg filter blur-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-12 w-32 h-20 bg-gradient-to-b from-white/90 to-gray-100/75 rounded-[40%] shadow-md filter blur-md transform translate-z-10"></div>
                            <div className="absolute top-6 left-24 w-20 h-18 bg-gradient-to-b from-white/85 to-gray-200/70 rounded-[50%] shadow-sm filter blur-md transform translate-z-15"></div>
                            <div className="absolute top-0 left-16 w-18 h-14 bg-white/40 rounded-full filter blur-lg transform translate-z-20"></div>
                        </div>
                        <div className="absolute top-48 right-1/5 w-60 h-24 opacity-85 animate-cloud4 transform translate-z-20">
                            <div className="absolute top-0 left-0 w-24 h-20 bg-gradient-to-b from-white/95 to-gray-200/80 rounded-[45%] shadow-lg filter blur-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-10 w-30 h-18 bg-gradient-to-b from-white/90 to-gray-100/75 rounded-[40%] shadow-md filter blur-md transform translate-z-10"></div>
                            <div className="absolute top-6 left-20 w-22 h-16 bg-gradient-to-b from-white/85 to-gray-200/70 rounded-[50%] shadow-sm filter blur-md transform translate-z-15"></div>
                            <div className="absolute top-0 left-12 w-16 h-12 bg-white/40 rounded-full filter blur-lg transform translate-z-20"></div>
                        </div>
                        <div className="absolute top-24 left-1/3 w-68 h-28 opacity-92 animate-cloud5 transform translate-z-25">
                            <div className="absolute top-0 left-0 w-30 h-24 bg-gradient-to-b from-white/95 to-gray-200/80 rounded-[45%] shadow-lg filter blur-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-14 w-34 h-22 bg-gradient-to-b from-white/90 to-gray-100/75 rounded-[40%] shadow-md filter blur-md transform translate-z-10"></div>
                            <div className="absolute top-6 left-26 w-24 h-20 bg-gradient-to-b from-white/85 to-gray-200/70 rounded-[50%] shadow-sm filter blur-md transform translate-z-15"></div>
                            <div className="absolute top-0 left-20 w-20 h-14 bg-white/40 rounded-full filter blur-lg transform translate-z-20"></div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Realistic Moon */}
                        <div className="absolute top-10 right-20 w-20 h-20 rounded-full shadow-xl overflow-hidden">
                        {/* Moon base with subtle texture */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
                            {/* Craters */}
                            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-gray-500/30 blur-[1px]"></div>
                            <div className="absolute top-1/3 right-1/5 w-6 h-6 rounded-full bg-gray-600/20 blur-[1px]"></div>
                            <div className="absolute bottom-1/4 left-1/3 w-5 h-5 rounded-full bg-gray-700/25 blur-[1px]"></div>
                            <div className="absolute top-2/5 right-1/3 w-3 h-3 rounded-full bg-gray-500/30 blur-[1px]"></div>
                            <div className="absolute bottom-1/3 right-1/4 w-7 h-7 rounded-full bg-gray-600/15 blur-[1px]"></div>

                            {/* Crescent shadow with soft edge */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/90 via-gray-900/70 via-gray-900/20 to-transparent"></div>

                            {/* Subtle glow */}
                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_5px_rgba(255,255,255,0.1)]"></div>
                        </div>
                        </div>

                        {/* Stars */}
                        <div className="absolute inset-0">
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute bg-white rounded-full animate-twinkle"
                                    style={{
                                        width: `${Math.random() * 3 + 1}px`,
                                        height: `${Math.random() * 3 + 1}px`,
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 5}s`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Meteors */}
                        <div className="absolute inset-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={`meteor-${i}`}
                                    className="absolute meteor animate-meteor"
                                    style={{
                                        top: `${Math.random() * 20}%`, // Start near the top
                                        left: `${Math.random() * 100}%`,
                                        width: `${Math.random() * 20 + 10}px`, // Random length between 10-30px
                                        animationDelay: `${Math.random() * 10}s`, // Random delay
                                        animationDuration: `${Math.random() * 2 + 1}s`, // Random duration between 1-3s
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Chinese City Skyline */}
                <div className="absolute bottom-0 left-0 w-2/5 h-2/5 transform translate-z-30">
                    <div className="absolute bottom-0 w-full flex items-end space-x-1">
                        <div className="h-56 w-10 relative transform translate-z-10">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-48 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-pink-500 rounded-full shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-8 bg-pink-400 rounded-full shadow-md transform translate-z-10"></div>
                                <div className="absolute top-32 w-full h-1 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-72 w-12 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-emerald-900 to-emerald-600 rounded-t-lg shadow-2xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-700/40 via-transparent to-emerald-700/40"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                                <div className="absolute top-24 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-64 w-14 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-amber-800 to-amber-500 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-12 bg-amber-600 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-8 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                                <div className="absolute top-20 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-48 w-16 relative transform translate-z-25">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-900 to-blue-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-6 bg-blue-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-10 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-40 w-12 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gray-800 to-gray-500 rounded-t-lg shadow-lg transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-8 bg-gray-600 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-52 w-14 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-red-900 to-red-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-10 bg-red-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-60 w-10 relative transform translate-z-10">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-teal-900 to-teal-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-8 bg-teal-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-14 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-68 w-16 relative transform translate-z-25">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-900 to-pink-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-12 bg-pink-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-20 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-50 w-12 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-cyan-900 to-cyan-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-6 bg-cyan-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-10 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-62 w-14 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-lime-900 to-lime-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-10 bg-lime-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-58 w-10 relative transform translate-z-10">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-indigo-900 to-indigo-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-8 bg-indigo-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-66 w-16 relative transform translate-z-25">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-orange-900 to-orange-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-12 bg-orange-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-18 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cambodian City Skyline */}
                <div className="absolute bottom-0 right-0 w-2/5 h-2/5 transform translate-z-30">
                    <div className="absolute bottom-0 w-full flex items-end space-x-1">
                        <div className="h-60 w-14 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-indigo-900 to-indigo-600 rounded-t-lg shadow-2xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-8 bg-indigo-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-52 w-16 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-10 bg-gray-600 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-44 w-12 relative transform translate-z-25">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-green-900 to-green-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-6 bg-green-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-8 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-48 w-14 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-orange-900 to-orange-600 rounded-t-lg shadow-lg transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-8 bg-orange-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-10 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-36 w-10 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-purple-900 to-purple-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-6 bg-purple-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-8 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-10 w-28 h-24 transform translate-z-30">
                            <div className="absolute bottom-0 left-0 w-full h-10 bg-stone-900 rounded-t-md shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-6 w-16 h-6 bg-stone-800 rounded-t-sm shadow-md transform translate-z-5"></div>
                                <div className="absolute top-0 left-8 w-12 h-10 bg-stone-700 rounded-t-full shadow-lg transform translate-z-10"></div>
                            </div>
                        </div>
                        <div className="h-56 w-12 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-cyan-900 to-cyan-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-10 bg-cyan-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-64 w-14 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-lime-900 to-lime-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-12 bg-lime-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-18 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-50 w-10 relative transform translate-z-10">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-teal-900 to-teal-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-6 bg-teal-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-10 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-70 w-16 relative transform translate-z-25">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-900 to-pink-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-12 bg-pink-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-20 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-54 w-12 relative transform translate-z-15">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-red-900 to-red-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-8 bg-red-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-62 w-14 relative transform translate-z-20">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-900 to-blue-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-10 bg-blue-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-16 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-58 w-12 relative transform translate-z-18">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-yellow-900 to-yellow-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-8 bg-yellow-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-14 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-46 w-10 relative transform translate-z-18">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-amber-900 to-amber-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-6 bg-amber-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-10 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-66 w-16 relative transform translate-z-28">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-emerald-900 to-emerald-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-12 bg-emerald-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-18 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-38 w-12 relative transform translate-z-12">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-violet-900 to-violet-600 rounded-t-lg shadow-xl transform rotate-x-10">
                                <div className="absolute top-0 left-0 w-full h-6 bg-violet-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-8 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-72 w-14 relative transform translate-z-30">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-rose-900 to-rose-600 rounded-t-lg shadow-xl transform rotate-x-12">
                                <div className="absolute top-0 left-0 w-full h-14 bg-rose-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-20 w-full h-2 bg-gray-400/60 shadow-inner"></div>
                            </div>
                        </div>
                        <div className="h-50 w-10 relative transform translate-z-16">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-sky-900 to-sky-600 rounded-t-lg shadow-xl transform rotate-x-15">
                                <div className="absolute top-0 left-0 w-full h-8 bg-sky-700 rounded-t-lg shadow-md transform translate-z-5"></div>
                                <div className="absolute top-12 w-full h-2 bg-gray-400/70 shadow-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Road with Cars and Trucks */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900 to-gray-700 transform translate-z-5">
                    <div className="absolute top-1/2 left-0 right-0 h-2 transform -translate-y-1/2 dashed-line shadow-md"></div>

                    {/* Car 1 */}
                    <div className="absolute bottom-12 left-1/5 w-24 h-12 animate-car1 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-gray-700 to-gray-400 rounded-t-md shadow-lg transform rotate-x-10">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-gray-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Car 2 */}
                    <div className="absolute bottom-12 left-2/5 w-24 h-12 animate-car2 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-green-700 to-green-400 rounded-t-md shadow-lg transform rotate-x-10">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-green-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Car 3 */}
                    <div className="absolute bottom-10 left-3/5 w-24 h-12 animate-car3 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-yellow-700 to-yellow-400 rounded-t-md shadow-lg transform rotate-x-12">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-yellow-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Truck 1 */}
                    <div className="absolute bottom-10 left-1/4 w-32 h-16 animate-truck1 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-12 bg-gradient-to-t from-red-800 to-red-500 rounded-t-lg shadow-lg transform rotate-x-12">
                            <div className="absolute top-0 left-2 w-12 h-8 bg-red-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-4 w-8 h-4 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-4 right-0 w-18 h-8 bg-red-700 rounded-t-sm shadow-md transform translate-z-4"></div>
                            <div className="absolute top-4 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-14 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Car 4 */}
                    <div className="absolute bottom-12 left-1/6 w-24 h-12 animate-car4 transform translate-z-20">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-teal-700 to-teal-400 rounded-t-md shadow-lg transform rotate-x-10">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-teal-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Car 5 */}
                    <div className="absolute bottom-10 left-2/6 w-24 h-12 animate-car5 transform translate-z-20">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-orange-700 to-orange-400 rounded-t-md shadow-lg transform rotate-x-12">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-orange-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Truck 4 */}
                    <div className="absolute bottom-8 left-3/6 w-36 h-18 animate-truck4 transform translate-z-20">
                        <div className="absolute bottom-2 left-0 w-full h-14 bg-gradient-to-t from-green-800 to-green-500 rounded-t-lg shadow-lg transform rotate-x-15">
                            <div className="absolute top-0 left-2 w-14 h-10 bg-green-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-4 w-10 h-4 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-4 right-0 w-20 h-10 bg-green-700 rounded-t-sm shadow-md transform translate-z-4"></div>
                            <div className="absolute top-4 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-16 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Car 6 */}
                    <div className="absolute bottom-12 left-5/6 w-24 h-12 animate-car6 transform translate-z-20">
                        <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-pink-700 to-pink-400 rounded-t-md shadow-lg transform rotate-x-10">
                            <div className="absolute top-0 left-4 w-16 h-4 bg-pink-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-1 left-6 w-12 h-3 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Truck 5 */}
                    <div className="absolute bottom-8 left-2/3 w-36 h-18 animate-truck5 transform translate-z-20">
                        <div className="absolute bottom-2 left-0 w-full h-14 bg-gradient-to-t from-orange-800 to-orange-500 rounded-t-lg shadow-lg transform rotate-x-15">
                            <div className="absolute top-0 left-2 w-14 h-10 bg-orange-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-4 w-10 h-4 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-4 right-0 w-20 h-10 bg-orange-700 rounded-t-sm shadow-md transform translate-z-4"></div>
                            <div className="absolute top-4 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-16 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Truck 2 */}
                    <div className="absolute bottom-8 left-1/3 w-36 h-18 animate-truck2 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-14 bg-gradient-to-t from-blue-800 to-blue-500 rounded-t-lg shadow-lg transform rotate-x-15">
                            <div className="absolute top-0 left-2 w-14 h-10 bg-blue-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-4 w-10 h-4 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-4 right-0 w-20 h-10 bg-blue-700 rounded-t-sm shadow-md transform translate-z-4"></div>
                            <div className="absolute top-4 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-16 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>

                    {/* Truck 3 */}
                    <div className="absolute bottom-8 left-4/5 w-36 h-18 animate-truck3 transform translate-z-10">
                        <div className="absolute bottom-2 left-0 w-full h-14 bg-gradient-to-t from-purple-800 to-purple-500 rounded-t-lg shadow-lg transform rotate-x-15">
                            <div className="absolute top-0 left-2 w-14 h-10 bg-purple-600 rounded-t-sm shadow-md transform translate-z-5"></div>
                            <div className="absolute top-2 left-4 w-10 h-4 bg-black/80 rounded-sm shadow-inner transform translate-z-6"></div>
                            <div className="absolute top-4 right-0 w-20 h-10 bg-purple-700 rounded-t-sm shadow-md transform translate-z-4"></div>
                            <div className="absolute top-4 right-1 w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_4px_#fff] transform translate-z-5"></div>
                        </div>
                        <div className="absolute bottom-0 left-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-16 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 right-4 w-6 h-4 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-md transform translate-z-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 rounded-full filter blur-sm transform translate-z-0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Background;
