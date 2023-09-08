const postTypeRadio = document.getElementsByName('post-type');
const existingPostSection = document.getElementById('existing-post');
const newPostSection = document.getElementById('new-post');

postTypeRadio.forEach(function(radio) {
  radio.addEventListener('change', function() {
    if (this.value === 'existing') {
      existingPostSection.style.display = 'block';
      newPostSection.style.display = 'none';
    } else if (this.value === 'new') {
      existingPostSection.style.display = 'none';
      newPostSection.style.display = 'block';
    }
  });
});

const postTitlesSelect = document.getElementById('post-titles');
const editTitleRadioYes = document.getElementsByName('edit-title')[0];
const newPasswordSection = document.getElementById('new-password');

postTitlesSelect.addEventListener('change', function() {
  if (this.value === '') {
    editTitleRadioYes.disabled = true;
    newPasswordSection.style.display = 'none';
  } else {
    editTitleRadioYes.disabled = false;
  }
});

const editTitleRadio = document.getElementsByName('edit-title');
const passwordField = document.getElementById('password');

editTitleRadio.forEach(function(radio) {
  radio.addEventListener('change', function() {
    if (this.value === 'yes') {
      passwordField.parentElement.style.display = 'block';
    } else {
      passwordField.parentElement.style.display = 'none';
    }
  });
});
