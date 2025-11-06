import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import background from '../assets/loginsignup_background.jpg';
import logo from '../assets/logo.png';

export default function Auth(){
    const location = useLocation();
    const navigate = useNavigate();
    const isLogin = location.pathname === '/login';

    const [formData, setFormData] = useState({ display_name: '', password: '' });
    const [errors, setErrors] = useState({ display_name: '', password: '' });
    const { login } = useAuth();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { name, value } = e.target;
        setFormData(prev => ( {...prev, [name]: value }));
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!formData.password.trim() && !formData.display_name.trim()) {
            setErrors({ display_name: '', password: ''})
            return;
        }
        
        const newErrors = { display_name: '', password: '' };

        if (!formData.display_name.trim()) newErrors.display_name = 'Please enter a display name';
    
        if (!formData.password.trim()) newErrors.password = 'Please enter a password';
        
        if (newErrors.display_name || newErrors.password) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await fetch('http://localhost:5715/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors({ 
                    display_name: data.field === 'display_name' ? data.message : '',
                    password: data.field === 'password' ? data.message : ''
                });
                return;
            }
            console.log(data.player.display_name)
            login(data.token, data.player.display_name)
        } catch (error) {
            console.error("Something went wrong, error");
        }
    }

    async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const newErrors = { display_name: '', password: '' };

        if (!formData.display_name.trim()) newErrors.display_name = 'Please enter a display name';
        
        if (!formData.password.trim()) newErrors.password = 'Please enter a password';
        
        if (newErrors.display_name || newErrors.password) {
            setErrors(newErrors);
            return;
        }

        try {
            let res = await fetch("http://localhost:5715/api/player", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            let data = await res.json();
            
            if (!res.ok) {
                setErrors({ 
                    display_name: data.error,
                    password: ''
                });
                return;
            }
            res = await fetch('http://localhost:5715/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            data = await res.json();
            
            login(data.token, data.player.display_name)
        } catch (error) {
            console.error("Something went wrong", error);
        }
    }

    function switchMode() {
        setErrors({ display_name: '', password: '' });
        setFormData({ display_name: '', password: '' });
        navigate(isLogin ? '/signup' : '/login');
    }

    return (
        <div className="w-full h-screen bg-cover bg-top" style={{ backgroundImage: `url(${background})` }}>
            <div 
                className="absolute top-0 left-0 h-full w-1/2 backdrop-blur-md bg-white/85"
                style={{
                    transform: isLogin ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.45s ease-in-out'
                }}
            >
                <form 
                    onSubmit={isLogin ? handleLogin : handleSignUp} 
                    className="flex flex-col items-center mt-[18%] space-y-4"
                >
                    <img src={logo} alt="Tags Icon" className="w-55 h-55" />
                    <h1 className='text-gray-700 text-5xl font-small'>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h1>
                    <input
                        className="text-xl mt-[4%] bg-gray-300 opacity-70 rounded-sm px-[4%] py-[2.5%] w-[55%] shadow-md text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        type="display_name"
                        id="display_name"
                        name="display_name"
                        placeholder="Display Name"
                        value={formData.display_name}
                        onChange={handleChange}
                    />
                    <div className='min-h-3'>
                        {errors.display_name && (
                            <p className="text-red-500 text-sm -mt-2">{errors.display_name}</p>
                        )}
                    </div>
                    
                    <input
                        className="text-xl -mt-1.5 bg-gray-300 opacity-70 rounded-sm px-[4%] py-[2.5%] w-[55%] shadow-md text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <div className='min-h-3'>
                        {errors.password && (
                            <p className="text-red-500 text-sm -mt-2">{errors.password}</p>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className=" mb-[3%] bg-blue-400 text-white font-semibold px-[4%] py-[2%] w-[55%] rounded-lg hover:bg-blue-500 active:bg-blue-600 transition-all"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                    <div>
                        <span className='text-xl'>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
                        <button 
                            type="button"
                            onClick={switchMode}
                            className="text-blue-500 text-xl hover:underline mt-2 drop-shadow"
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
