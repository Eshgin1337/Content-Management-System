const form = document.querySelector(".form");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const role = document.querySelector("#role");
const usernameError = document.createElement("div");
const emailError = document.createElement("div");

form.addEventListener("submit", e => {
  e.preventDefault();
  let isValid = true;

  usernameError.textContent = "";
  emailError.textContent = "";

  if (!/^[a-zA-Z]/.test(username.value) || username.value.length < 5 || username.value.length > 15) {
    usernameError.textContent = "Username should start with a letter and should be between 5 and 15 character length";
    isValid = false;
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.value)) {
    emailError.textContent = "Email is not valid";
    isValid = false;
  }

  if (!isValid) {
    username.style.border = "1px solid red";
    email.style.border = "1px solid red";
    username.parentElement.appendChild(usernameError);
    email.parentElement.appendChild(emailError);
    return;
  }else {
    fetch(`http://mydata.az/edit/${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({username: username, email: email, role: role.value}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("User details updated successfully");
      })
      .catch((error) => {
        console.error(error);
        alert("There was an error updating the user details");
      });
  }

});
