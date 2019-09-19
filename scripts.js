const DATABASE_URI = 'http://localhost:3000/contacts';
let EDIT_VOTER;
let ALLVOTERS;
//var newPdp=[];
//var newApc=[];
const form = document.querySelector('form');
const submitNewVoter = document.querySelector('#submit-new-contact');
const submitEditedVoter = document.querySelector('#submit-edited-contact');
submitEditedVoter.style.display = 'hidden';
//
// Set the date we're counting down to
var countDownDate = new Date("Sep 30, 2019 0:00:00").getTime();

// Update the count down every 1 second
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

    // Output the result in an element with id="demo"
    document.getElementById("demo").innerHTML = days + "d " + hours + "h " +
        minutes + "m " + seconds + "s ";

    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("demo").innerHTML = "EXPIRED";
    }
}, 1000);

// get data from our backend
const getContact = async() => {
    const response = await fetch(DATABASE_URI);
    const voters = await response.json();
    ALLVOTERS = voters
    populateContacts(voters);
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

    // register button actions
    editVoters.forEach(button =>
        button.addEventListener('click', ({ path }) => {
            submitNewVoter.style.display = 'none';
            submitEditedVoter.style.display = 'unset';

            const contact = JSON.parse(path[2].dataset.contact);
            for (const key in form.elements) {
                const inputElement = form.elements[key];
                inputElement.value = contact[inputElement.name];
            }

            EDIT_VOTER = contact;
        })
    );

    deleteVoters.forEach(button =>
        button.addEventListener('click', async({ path }) => {
            const contact = path[2];
            const { id } = JSON.parse(path[2].dataset.contact);
            contact.remove();
            Swal.fire(` DELETE SUCCESSFUL`);

            await fetch(`${DATABASE_URI}/${id}`, {
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
const populateContacts = voters => {
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

submitNewVoter.addEventListener('click', async() => {
    event.preventDefault();
    const contact = {};

    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                contact[inputElement['name']] = (inputElement.value).toUpperCase();
                Swal.fire(`VOTING SUCCESSFUL`);
            }
        }
    }

    console.log(contact);


    if (!Object.values(contact).length) return;

    const votedAlready = ALLVOTERS.find(voter => voter.cardNumber == contact.cardNumber)
    console.log(votedAlready);

    if (votedAlready) {

        for (const key in form.elements) {
            if (form.elements.hasOwnProperty(key)) {
                const inputElement = form.elements[key];
                inputElement.value = ''
                Swal.fire(`VOTED ALREADY!!!, FRAUD ALERT!!!`);
            }
        }

        return
    }


    const response = await fetch(DATABASE_URI, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
    });

    await response.json();
});

submitEditedVoter.addEventListener('click', async() => {
    event.preventDefault();
    submitNewVoter.style.display = 'unset';

    const contact = {};



    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                contact[inputElement['name']] = (inputElement.value).toUpperCase();
                Swal.fire(` EDITED SUCCESSFULLY`);
            }
        }
    }


    if (!Object.values(contact).length) return;



    const response = await fetch(`${DATABASE_URI}/${EDIT_VOTER.id}`, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...contact })
    });

    await response.json();
});



$(document).ready(getContact)