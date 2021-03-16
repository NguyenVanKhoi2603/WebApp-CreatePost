$("#login").click(function () {
    var username = $('#username').val();
    var password = $('#password').val();

    $.ajax({
        method: "POST",
        url: "http://localhost:3001/login",
        data: { username: username, password: password }
    }).done(function (msg) {
        localStorage.setItem("token", msg.accessToken);

    });
    return false
});



