import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GroupForms() {
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
    });

    const { name, description } = newGroup;

    const onChange = (e) => {
        setNewGroup((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!name) {
            alert('Please give the group a name');
        }
        else {

            const loggedInUser = JSON.parse(localStorage.getItem('user'))

            const token = loggedInUser.token

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            try {

                const response = await axios.post('/api/groups', newGroup, config);

                console.log("Group Created:", response.data);

                setNewGroup({ name: '', description: '' });

                window.location.reload();

            } catch (error) {
                console.log(error);
                alert("Failed to create group");
            }

        }
    }


    return (
        <>
            <section className='form'>
                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            id='name'
                            name='name'
                            value={name}
                            placeholder='Enter group name...'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            id='name'
                            name='description'
                            value={description}
                            placeholder='Enter group description...'
                            onChange={onChange}
                        />
                    </div>
                    <div className='form-group'>
                        <button type='submit' className='btn btn-block'>
                            Submit
                        </button>
                    </div>
                </form>
            </section>
        </>
    )
}




export default GroupForms