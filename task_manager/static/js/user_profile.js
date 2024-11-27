const passwordTxt = document.querySelector('.pw-textbox');
const innerContainer =  passwordTxt.querySelector('.flex-row');

passwordTxt.addEventListener('mouseover', ()=> {
    if(!innerContainer.querySelector('#edit-button')) {
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-light flex-shrink-1 align-self-end ms-2';
        editButton.id = 'edit-button';
        editButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
            </svg>
        `;
    
        innerContainer.appendChild(editButton);
        let temp = innerContainer;

        editButton.addEventListener('click', function (e) {
            e.preventDefault();
            const new_password = `
            <div class="grid w-75" style="display: flex; justify-content: flex-start;">
                <div class="g-col-6" style="flex: 1; max-width: 50%;">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password1" placeholder="" value="" required="">
                    <div class="invalid-feedback">
                        Password required
                    </div>
                </div>
        
                <div class="g-col-6" style="flex: 1; max-width: 50%; margin-left: 1rem;">
                    <label for="password" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="password2" placeholder="" value="" required="">
                    <div class="invalid-feedback">
                        Passwords must match
                    </div>
                </div>
                <button class="btn btn-light flex-shrink-1 align-self-end ms-2" id="exit-password-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                </button>
            </div>
            `;
            innerContainer.remove();
            passwordTxt.innerHTML = new_password;

            const ex = passwordTxt.querySelector('#exit-password-button');
            if(ex) {
                ex.addEventListener('click', function (e) {
                    passwordTxt.innerHTML = "";
                    passwordTxt.appendChild(temp);
                });
            }
        })
    }
});

passwordTxt.addEventListener('mouseleave', () => {
    const editButton = innerContainer.querySelector('#edit-button');
    if (editButton) {
        editButton.remove();
    }
});

{/* <div class="col-sm-6">
<label for="password" class="form-label">Password</label>
<input type="password" class="form-control" id="password" placeholder="{{ user.password }}" value="" readonly>
<div class="invalid-feedback">
  Password Required
</div>
</div> */}

{/* <button class="btn px-0 mx-0 flex-shrink-1 align-self-start" id="add-more-btn">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
  </svg>
</button> */}