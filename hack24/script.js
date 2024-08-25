function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

document.getElementById('signupButton').addEventListener('click', function() {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    this.classList.add('active');
    document.getElementById('loginButton').classList.remove('active');
});

document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    this.classList.add('active');
    document.getElementById('signupButton').classList.remove('active');
});

document.querySelector('#signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const data = {
        firstName: event.target[0].value,
        lastName: event.target[1].value,
        email: event.target[2].value,
        password: event.target[3].value
    };

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {
        // After a successful signup, redirect to the desired page
        window.location.href = 'landing.html'; // Replace 'welcome.html' with your desired page
    })
    .catch(error => console.error('Error:', error));
});