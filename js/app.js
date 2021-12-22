console.log('funcionando')

const botonIngresar = document.getElementById('botonIngresar')
const botonCerrarSesion = document.getElementById('botonCerrarSesion')
const formulario = document.getElementById('formulario')
const nombreUsuario = document.getElementById('nombreUsuario')
const containerMensajes = document.getElementById('containerMensajes')
const inputMensajes = document.getElementById('inputMensaje')

firebase.auth().onAuthStateChanged((user)=>{
    if (user) {
        console.log(user)
        formulario.classList.remove('d-none')
        nombreUsuario.innerHTML = user.displayName
        containerMensajes.innerHTML = ''
        cerrarSesion()
        contenidoChat(user)
    } else {
        console.log('no hay usuario registrado')
        formulario.classList.add('d-none')
        nombreUsuario.innerHTML = 'Chat'
        containerMensajes.innerHTML = `<p class="lead mt-5 text-center">Debe Iniciar Sesion</p>`
        containerMensajes.classList.remove('container-chat')
        ingresar()
    }
})

const contenidoChat = user => {
    formulario.addEventListener('submit', (e) => {
        e.preventDefault()
        if (!inputMensajes.value.trim()) {
            console.log('texto vacio')
            return
        }

        firebase.firestore().collection('chat').add({
            texto: inputMensajes.value,
            uid: user.uid,
            fecha: Date.now()
        }).then (res => {
            console.log('texto agregado')
        })

        inputMensajes.value = ''
        
    })

    firebase.firestore().collection('chat').orderBy('fecha')
    .onSnapshot((snapshot)=> {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                console.log('chat: ', change.doc.data())

                if (user.uid === change.doc.data().uid) {
                    containerMensajes.innerHTML += `
                    <div class="text-end">
                        <span class="badge bg-primary">${change.doc.data().texto}</span>
                    </div>
                    `
                } else {
                    containerMensajes.innerHTML += `
                    <div class="text-start">
                        <span class="badge bg-secondary">${change.doc.data().texto}</span>
                    </div>
                    `
                }
                
                containerMensajes.scrollTop = containerMensajes.scrollHeight

            }
            
        })
    })

}

const ingresar = () => {
    botonIngresar.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await firebase.auth().signInWithPopup(provider)
        } catch (error) {
            console.log(error)
        }
    })
}

const cerrarSesion = () => {
    botonCerrarSesion.addEventListener('click', () => {
        firebase.auth().signOut()
    })
}

