import { Link, usePage, useForm, Head } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { EzeLogoForLogin } from "../../Logo/EzeLogo"; // Assuming this is your logo component
import { Background } from "../../background-animation/background";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isDay, setIsDay] = useState(true);
    const { errors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        username: '',
        password: '',
    });

    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            setIsDay(hour >= 6 && hour < 18); // Day: 6 AM - 6 PM, Night: 6 PM - 6 AM
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            preserveScroll: true,
            onSuccess: () => {
                // Handle successful login if needed
            },
        });
    };

    return (

        <>
            <Head title="Login"/>
            <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDay ? 'bg-blue-50' : 'bg-gray-900'}`}>
                <Background />
                <div className={`w-[25rem] p-8 rounded-lg shadow-2xl max-w-md z-10 relative ${isDay ? 'bg-white bg-opacity-95 backdrop-blur-md border border-white/30' : 'bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700/50'}`}>
                    <div className="flex justify-center mb-6">
                        <EzeLogoForLogin className="h-12 w-auto" />
                    </div>
                    <div className="flex justify-center mb-6">
                        <h1 className={`block text-xl font-bold mb-2 ${isDay ? 'text-gray-700' : 'text-gray-200'}`}>
                            Sign in to your account
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="username" className={`block text-sm font-bold mb-2 ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:border-transparent ${isDay ? 'border-gray-300' : 'border-gray-600 bg-gray-700 text-gray-200'}`}
                                placeholder="Enter your username"
                                autoComplete="off"
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className={`block text-sm font-bold mb-2 ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:border-transparent ${isDay ? 'border-gray-300' : 'border-gray-600 bg-gray-700 text-gray-200'}`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDay ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full flex items-center border justify-center font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ff8800] focus:ring-opacity-50 disabled:opacity-50 ${isDay ? 'border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white' : 'border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-white'}`}
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>

    );
};

export default Login;


