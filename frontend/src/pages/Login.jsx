    import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })


    const { email, password } = formData

    const navigate = useNavigate();


    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!password || !email) {
            alert("please fill out all fields");
        }
        const response = await axios.post('api/users/login', formData);

        localStorage.setItem('user', JSON.stringify(response.data));

        navigate('/');
    }



return (
    <>
        <section className='heading'>
            <h1>Login</h1>
            <p>Login to your account</p>
        </section>

        <section className='form'>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <input
                        type='email'
                        className='form-control'
                        id='email'
                        name='email'
                        value={email}
                        placeholder='Enter your email'
                        onChange={onChange}
                    />
                </div>

                <div className='form-group'>
                    <input
                        type='password'
                        className='form-control'
                        id='password'
                        name='password'
                        value={password}
                        placeholder='Enter password'
                        onChange={onChange}
                    />
                </div>
                <div className='form-group'>
                    <button type='submit' className='btn btn-block'>
                        Login
                    </button>
                </div>
            </form>
        </section>
    </>
)
}
export default Login