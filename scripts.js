const DATABASE_URI = 'http://localhost:3000/contacts';
let EDIT_CONTACT;
let ALLVOTERS;
//var newPdp=[];
//var newApc=[];
const form = document.querySelector('form');
const submitNewContact = document.querySelector('#submit-new-contact');
const submitEditedContact = document.querySelector('#submit-edited-contact');
submitEditedContact.style.display = 'hidden';
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
    const contacts = await response.json();
    ALLVOTERS = contacts
    populateContacts(contacts);
    console.log(contacts)

    var pdpVotes = [];
    var PDP = 0;
    var apcVotes = [];
    var APC = 0;
    for (var i = 0; i < contacts.length; i++) {
        pdpVotes = contacts[i];
        if (pdpVotes.party == "PDP") {
            PDP++

        }
    }
    for (var j = 0; j < contacts.length; j++) {
        apcVotes = contacts[j];
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
    const editContacts = document.querySelectorAll('#edit');

    const deleteContacts = document.querySelectorAll('#delete');

    // register button actions
    editContacts.forEach(button =>
        button.addEventListener('click', ({ path }) => {
            submitNewContact.style.display = 'none';
            submitEditedContact.style.display = 'unset';

            const contact = JSON.parse(path[2].dataset.contact);
            for (const key in form.elements) {
                const inputElement = form.elements[key];
                inputElement.value = contact[inputElement.name];
            }

            EDIT_CONTACT = contact;
        })
    );

    deleteContacts.forEach(button =>
        button.addEventListener('click', async({ path }) => {
            const contact = path[2];
            const { id } = JSON.parse(path[2].dataset.contact);
            contact.remove();

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
const populateContacts = contacts => {
    const formatedContacts = contacts.map(formatContact);
    const displayContacts = document.querySelector('.display-contacts');

    displayContacts.innerHTML += formatedContacts.join('');
};

// get single contact data and formate it
const formatContact = contact => {
    const { firstName, lastName, cardNumber } = contact;
    return `
  <div class='contact' data-contact=${JSON.stringify(contact)}>
      <div> ${firstName} ${lastName}</div>
      <div> ${cardNumber}</div>
      <div class='edit-contact'>
            <button id='edit'>Edit</button>
            <button id='delete'>Delete</button>
      </div>
  </div>
  `;
};

submitNewContact.addEventListener('click', async() => {
    event.preventDefault();
    const contact = {};

    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                contact[inputElement['name']] = (inputElement.value).toUpperCase();
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

submitEditedContact.addEventListener('click', async() => {
    event.preventDefault();
    submitNewContact.style.display = 'unset';

    const contact = {};



    for (const key in form.elements) {
        if (form.elements.hasOwnProperty(key)) {
            const inputElement = form.elements[key];
            if (inputElement['name'] && inputElement.value) {
                contact[inputElement['name']] = (inputElement.value).toUpperCase();
            }
        }
    }


    if (!Object.values(contact).length) return;



    const response = await fetch(`${DATABASE_URI}/${EDIT_CONTACT.id}`, {
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