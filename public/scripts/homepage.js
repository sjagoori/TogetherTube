console.log("homepage.js running");

const form = document.forms[0];
form.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  let prep = e.target[1].value.match(
    /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  );

  return prep ? form.submit() : (e.target[0].style.color = "red");
}
