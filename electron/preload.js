const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    callBackend: async (endpoint) => {
        const response = await fetch(`http://localhost:8080${endpoint}`);
        return response.json();
    },
    postBackend: async (endpoint, data) => {
        const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
});
