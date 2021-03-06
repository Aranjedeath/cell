// Removes #register if coming from /signin#register
window.location.hash = '';
if(history.pushState) {
    history.pushState('', document.title, window.location.pathname);
}

// Edit user profile
// up == user profile
var upEdit          = document.getElementById('user-profile-edit');
var upUsername      = document.getElementById('user-profile-username');
var upLocation      = document.getElementById('user-profile-location');
var upLocationInput = document.getElementById('user-profile-location-input');
var upFacebookInput = document.getElementById('user-profile-facebook-input');
var upTwitterInput  = document.getElementById('user-profile-twitter-input');

var editing = false;
var upUsernameCurrent = upUsername.innerHTML;
var upLocationCurrent = upLocation.innerHTML;
var href              = upFacebookInput.previousSibling.href.split('/');
var upFacebookCurrent = href[href.length - 1];
var href              = upTwitterInput.previousSibling.href.split('/');
var upTwitterCurrent  = href[href.length - 1];

// Force details to be empty for simpler change check below
if(upLocationCurrent == 'No location details') { upLocationCurrent = ''; }
if(upFacebookCurrent.slice(-1) == '#')         { upFacebookCurrent = ''; }
if(upTwitterCurrent.slice(-1) == '#')          { upTwitterCurrent  = ''; }

if(upEdit) {
    upEdit.addEventListener('click', function(e) {
        e.preventDefault();

        if(editing) {
            // Save
            // Only send the request if something has changed
            if(upLocationInput.value == upLocationCurrent && upFacebookInput.value == upFacebookCurrent && upTwitterInput.value == upTwitterCurrent) {
                resetForm();
            } else {
                document.getElementById('full-page-overlay').className += ' full-page-overlay--loading';

                // Check if location is profanity free
                var data = 'str=' + upLocationInput.value;
                var request = new XMLHttpRequest;
                request.open('POST', '/php/checkProfanity.php', true);
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                request.send(data);

                request.onreadystatechange = function() {
                    if(request.readyState == 4 && request.status == 200) {
                        var containsProfanity = request.responseText;

                        if(!containsProfanity) {
                            var data = 'location=' + upLocationInput.value + '&facebook=' + upFacebookInput.value + '&twitter=' + upTwitterInput.value;
                            var request2 = new XMLHttpRequest;
                            request2.open('POST', '/php/saveUserProfile.php', true);
                            request2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                            request2.send(data);

                            request2.onreadystatechange = function() {
                                if(request2.readyState == 4 && request2.status == 200) {
                                    resetForm();
                                    location.reload();
                                }
                            }

                            request2.onerror = function() {
                                alert('Something went wrong. Please try again.');
                            };
                        } else {
                            alert('No profanity please');
                        }
                    }
                }
            }

            function resetForm() {
                editing = false;
                upEdit.innerHTML = '<i class="ico-edit"></i> EDIT PROFILE';

                // Reinstate username
                upUsername.innerHTML = upUsernameCurrent;

                // Hide input fields
                upLocationInput.className += ' user-profile-input--hidden';
                upFacebookInput.className += ' user-profile-input--hidden';
                upTwitterInput.className  += ' user-profile-input--hidden';
            }
        } else {
            // Edit
            editing = true;
            upEdit.innerHTML = '<i class="ico-save"></i> SAVE CHANGES';

            // Show link to Gravatar
            upUsername.innerHTML = '<a href="http://gravatar.com/" target="_blank" title="Change your avatar at Gravatar.com"><i class="ico-edit"></i>Gravatar.com</a>';

            // Show input fields
            upLocationInput.className = upLocationInput.className.replace(' user-profile-input--hidden', '');
            upFacebookInput.className = upFacebookInput.className.replace(' user-profile-input--hidden', '');
            upTwitterInput.className  = upTwitterInput.className.replace(' user-profile-input--hidden', '');

            // If location has already been entered, put it into the input field
            if(upLocation.innerHTML != 'No location details') {
                upLocationInput.value = upLocationCurrent;
            }

            // Show link to Gravatar
            upUsername.innerHTML = '<a href="http://gravatar.com/" target="_blank" title="Change your avatar at Gravatar.com"><i class="ico-edit"></i>Gravatar.com</a>';

            // Show input fields
            upLocationInput.className = upLocationInput.className.replace(' user-profile-input--hidden', '');
            upFacebookInput.className = upFacebookInput.className.replace(' user-profile-input--hidden', '');
            upTwitterInput.className  = upTwitterInput.className.replace(' user-profile-input--hidden', '');

            // If location has already been entered, put it into the input field
            if(upLocation.innerHTML != 'No location details') {
                upLocationInput.value = upLocationCurrent;
            }

            // If Facebook/Twitter usernames have already been entered, put them into the input fields
            if(upFacebookInput.previousSibling.href.slice(-1) != '#') {
                upFacebookInput.value = upFacebookCurrent;
            }

            if(upTwitterInput.previousSibling.href.slice(-1) != '#') {
                upTwitterInput.value = upTwitterCurrent;
            }
        }
    });
}

// Delete environment
var envDelete = document.querySelectorAll('.env-delete');

for(var i = 0; i < envDelete.length; i++) {
    envDelete[i].addEventListener('click', deleteEnvironment);
}

function deleteEnvironment(e) {
    e.preventDefault();

    var envName = e.target.parentNode.getElementsByTagName('h1')[0].innerHTML;
    var confirm = window.confirm('Are you sure you want to delete environment: ' + envName + '?');

    if(confirm) {
        var url         = e.target.parentNode.parentNode.href;
        var index       = url.lastIndexOf('/');
        var envDeleteId = url.substr(index + 1);

        var data = 'envDeleteId=' + envDeleteId;
        var request = new XMLHttpRequest;
        request.open('POST', '/php/deleteEnv.php', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(data);

        request.onreadystatechange = function() {
            if(request.readyState == 4 && request.status == 200) {
                location.reload();
            } else if(request.status != 200) {
                alert('An error has occurred. Please try again.');
            }
        }
    }
}