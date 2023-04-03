const form = document.querySelector(".form");
const username = document.querySelector("#username");
const previous_username = document.querySelector("#previous_username");
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
  } else {
    fetch(`http://mydata.az/edit/${username}`, {
      method: "POST",
      headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
      body: JSON.stringify({username: username.value, email: email.value, role: role.value, previous_username: previous_username.value}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.res === "ok") {
          swal({  
              title: "Successfully edited!",  
              text: "Click!",  
              icon: "success"
          }).then(ifConfirm => {
            if (ifConfirm) {
              setTimeout(() => {
                  window.location = "http://mydata.az/systemusers";
              }, 1000);
            }
          });  
        } else if (data.res === "You are not authenticated") {
          swal("Your session has expired!")
          .then(ifConfirm => {
            if (ifConfirm) {
              setTimeout(() => {
                window.location = "/login";
              }, 1000);
            }
          })
        } else if (data.res === "This user does not exist.") {
          swal("This user does not exist!")
          .then(ifConfirm => {
            if (ifConfirm) {
              setTimeout(() => {
                window.location = "/logout";
              }, 1000);
            }
          })
        } else if (data.res === "Only admins can edit user details.") {
          swal("Only admins can edit user details!")
          .then(ifConfirm => {
            if (ifConfirm) {
              setTimeout(() => {
                window.location = "/";
              }, 1000);
            }
          })
        }
      })
  }

});
