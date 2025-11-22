const responseDiv = document.getElementById('response');

function displayResponse(data) {
    responseDiv.textContent = JSON.stringify(data, null, 2);
}

function displayError(error) {
    responseDiv.textContent = `Error: ${error.message}`;
    responseDiv.style.borderLeftColor = '#dc3545';
}

document.getElementById('getBtn').addEventListener('click', async () => {
    try {
        const data = await window.api.callBackend('/hello');
        displayResponse(data);
    } catch (error) {
        displayError(error);
    }
});

document.getElementById('getDataBtn').addEventListener('click', async () => {
    try {
        const data = await window.api.callBackend('/data');
        displayResponse(data);
    } catch (error) {
        displayError(error);
    }
});

document.getElementById('postBtn').addEventListener('click', async () => {
    try {
        const name = document.getElementById('nameInput').value;
        const data = await window.api.postBackend('/greet', { name });
        displayResponse(data);
    } catch (error) {
        displayError(error);
    }
});
