// Get the modal
let modal = document.getElementById("modal");
// Get the button that opens the modal
let modal_button = document.getElementById("modal-button");

if(modal && modal_button)
{
  // Get the elements that closes the modal
  let close_elements = document.getElementsByClassName("close");
  for(let close_element of close_elements)
  {
      close_element.onclick = function() {
          modal.style.display = "none";
      }
  }

  // When the user clicks the button, open the modal 
  modal_button.onclick = function() {
      modal.style.display = "block";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
