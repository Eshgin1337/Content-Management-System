// Get the radio buttons and the select heading div
const radioNew = document.getElementById("new");
const radioExisting = document.getElementById("existing");
const selectHeadingDiv = document.getElementById("selectheading");
const typeHeadingDiv = document.getElementById("addheading");

// Add event listeners to the radio buttons
radioNew.addEventListener("click", () => {
  // Hide the select heading div and show the type heading div
  selectHeadingDiv.style.display = "none";
  typeHeadingDiv.style.display = "block";
});

radioExisting.addEventListener("click", () => {
  // Show the select heading div and hide the type heading div
  selectHeadingDiv.style.display = "block";
  typeHeadingDiv.style.display = "none";
});
