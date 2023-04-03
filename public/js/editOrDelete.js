function deleteUser(userEmail) {
    swal({
        title: "Deleting user from system",
        text: "Are you sure to delete this user?",
        cancelButtonText: 'Cancel',
        buttons: {
            cancel:true,
            add:{text: "Accept!",className:"swal-button2"},
            },
        }).then(ifconfirm=>{
            if (ifconfirm){
                fetch('https://mydata.az/deleteuser', {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "userEmail": userEmail })
                }).then(function (response) {
                    if (response.status === 401) {
                        swal({  
                            title: "You are not authorized to perform this operation",  
                            text: "Unauthorized!",  
                            icon: "error" 
                        }).then(function () {
                            window.location = "https://mydata.az/login"
                        });   
                    }
                    else if (response.status === 403) {
                        swal({  
                            title: "Only admins can add or remove users",  
                            text: "Forbidden!",  
                            icon: "error" 
                        }).then(function () {
                            window.location = "https://mydata.az/login"
                        });   
                    }
                    else if (response.status === 401) {
                        swal({  
                            title: "You are not authorized to perform this operation",  
                            text: "Unauthorized!",  
                            icon: "error"
                        }).then(function () {
                            setTimeout(() => {
                                window.location = "https://mydata.az/login";
                            }, 1000);
                        });   
                    }
                    else if (response.status === 200) {
                        swal({  
                            title: "Successfully deleted!",  
                            text: "Click!",  
                            icon: "success"
                        }).then(function () {
                            setTimeout(() => {
                                window.location = "https://mydata.az/systemusers";
                            }, 1000);
                        });  
                    }
                });
                
            }
        });
};

function editUser(username) {
    window.location = `/edit/${username}`;
}
