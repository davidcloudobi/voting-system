//Ccreat three variables and assign one to the database
const DATABASE_URI = 'http://localhost:3000/voters';
let EDIT_VOTER;
let ALLVOTERS;

//The querySelector() method returns the first element that matches a specified CSS selector(s) in the document
const form = document.querySelector('form');
const submitNewVoter = document.querySelector('#submit-new-voter');
const submitEditedVoter = document.querySelector('#submit-edited-voter');
submitEditedVoter.style.display = 'hidden';
//add the countdown 
//returns the numeric value corresponding to the time for the specified date according to universal time
// Set the date we're counting down to
var countDownDate = new Date("Sep 30, 2019 0:00:00").getTime();

//set the setInteval and the clearInterval to  update the count down every 1 second
var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo" in the wanted UI
    document.getElementById("demo").innerHTML = days + "days-" + hours + "h-" +
        minutes + "m-" + seconds + "s";

    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("demo").innerHTML = "VOTING CLOSED";
    }
}, 1000);

// fetching our database
const getVoter = async() => {
    const response = await fetch(DATABASE_URI);
    const voters = await response.json();
    ALLVOTERS = voters
    populateVoters(voters);
    console.log(voters)

    var pdpVotes = [];
    var PDP = 0;
    var apcVotes = [];
    var APC = 0;
    for (var i = 0; i < voters.length; i++) {
        pdpVotes = voters[i];
        if (pdpVotes.party == "PDP") {
            PDP++

        }
    }
    for (var j = 0; j < voters.length; j++) {
        apcVotes = voters[j];
        if (apcVotes.party == "APC") {
            APC++
        }

    }

    // alert("PDP total votes is " + PDP);
    //alert("APC total votes is " + APC);
    console.log(PDP)
        // var answer = document.createElement('div')
        // var para = document.createElement('p')
        // para.textContent = APC
    console.log(APC)
        //  const u = document.querySelectorAll('#me');

    Swal.fire(`PDP total votes is ${PDP} <br /> <br /> APC total votes is ${APC}`);
    // get button actions from page and register event listeners
    const editVoters = document.querySelectorAll('#edit');

    const deleteVoters = document.querySelectorAll('#delete');

    // add event listener to all buttons
    editVoters.forEach(button =>
        button.addEventListener('click', ({ path }) => {
            submitNewVoter.style.display = 'none';
            submitEditedVoter.style.display = 'unset';
            //loop through the form elements
            const cont = JSON.parse(path[2].dataset.contact);
            for (const key in form.elements) {
                const inputElement = form.elements[key];
                inputElement.value = cont[inputElement.name];
            }

            EDIT_VOTER = cont;
        })
    );
    //add event listener to our delete buttons
    deleteVoters.forEach(button =>
        button.addEventListener('click', async({ path }) => {
            const voter = path[2];
            const { id } = JSON.parse(path[2].dataset.contact);
            //remove data
            voter.remove();
            //pop-up messgae
            Swal.fire(` DELETE SUCCESSFUL`);
            //fetch the id of what we want to delete from the database
            await fetch(`${DATABASE_URI}/${id}`, {
                //delete action
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        })
    );
};

// get data and populate our page with data
const populateVoters = voters => {
    const formatedVoters = voters.map(formatVoter);
    const displayVoters = document.querySelector('.display-contacts');

    displayVoters.innerHTML += formatedVoters.join('');
};

// get single contact data and formate it
const formatVoter = voter => {
    const { firstName, lastName, cardNumber } = voter;
    return `
  <div class='contact' data-contact=${JSON.stringify(voter)}>
      <div> ${firstName} ${lastName}</div>
      <div> ${cardNumber}</div>
      <div class='edit-contact'>
            <button id='edit'>Edit</button>
            <button id='delete'>Delete</button>
      </div>
  </div>
  `;
};
//add event listener to our submit button
//the async function always return a promise
submitNewVoter.addEventListener('click', async() => {
    event.preventDefault();
    const voters = {};
    //loop through the form names and value
    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            //it returns a boolean ,then if true
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                //each  form name=its value and changed to upperscase
                voters[inputElement['name']] = (inputElement.value).toUpperCase();
                Swal.fire(`VOTING SUCCESSFUL`);
            }
        }
    }

    console.log(voters);
    //if no form name and value found,then return nothing

    if (!Object.values(voters).length) return;

    // To avoid double vote
    //the newly voter card number is matched with the database collections of card numbers

    const votedAlready = ALLVOTERS.find(voter => voter.cardNumber == voters.cardNumber)
    console.log(votedAlready);

    if (votedAlready) {
        //if a match is found, nothing is added to the database and a fraud message is pops up
        for (const key in form.elements) {
            if (form.elements.hasOwnProperty(key)) {
                const inputElement = form.elements[key];
                inputElement.value = ''
                Swal.fire(`VOTED ALREADY!!!, FRAUD ALERT!!!`);
            }
        }

        return
    }

    // the javascript stops until the promise is resolved
    //we fetch our database to post
    const response = await fetch(DATABASE_URI, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        //we change our voters to a string
        body: JSON.stringify(voters)
    });
    //we specify the format our database is
    await response.json();
});

//add event listener to our submiteditedvoter button with an async promise
submitEditedVoter.addEventListener('click', async() => {
    event.preventDefault();
    submitNewVoter.style.display = 'unset';

    const voter = {};



    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                voter[inputElement['name']] = (inputElement.value).toUpperCase();
                Swal.fire(` EDITED SUCCESSFULLY`);
            }
        }
    }


    if (!Object.values(voter).length) return;


    //javascript pause and wait for the above promise to be resolved 
    //fetch the database and put
    const response = await fetch(`${DATABASE_URI}/${EDIT_VOTER.id}`, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        //we changed all elements of voters to strings
        body: JSON.stringify({...voter })
    });
    // specify the format of the database
    await response.json();
});



$(document).ready(getVoter)