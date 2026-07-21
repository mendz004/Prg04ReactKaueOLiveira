import axios from 'axios';

// Cria uma instância centralizada com a URL do  Spring Boot
export const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});