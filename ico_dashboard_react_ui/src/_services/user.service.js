import config from 'config';
import { authHeader } from '../_helpers';
import axios from "axios";
import { compose } from 'redux';


export const userService = {
    login,
    signup,
    logout,
    getAll
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        "Content-Type": "application/json",
        body: { "email": username, "password": password }
    };

    return axios.post('http://localhost/api/login', {
        "email": username, "password": password
    })
        // fetch(`http://localhost/api/login`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function signup(username, password) {
    return axios.post('http://localhost/signup', {
        "email": username, "password": password
    })
        .then(user => {
            if (user.data.status) {
                return user
            } else {
                const error = user.data.info;
                return Promise.reject(error);
            }
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}