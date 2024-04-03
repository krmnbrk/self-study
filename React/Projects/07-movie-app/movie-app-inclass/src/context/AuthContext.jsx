import {
     GoogleAuthProvider, 
     createUserWithEmailAndPassword, 
     onAuthStateChanged, 
     signInWithEmailAndPassword, 
     signInWithPopup, 
     signOut, 
     updateProfile } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom"
import { toastSuccessNotify } from "../helpers/toastNotify";

//! create context
const AuthContext = createContext();

//? context provider

const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState("");
    const navigate = useNavigate()

    const register = async (email, password, displayName) => {
        //? yeni bir kullanıcı oluşturmak için kullanılan firebase metodu
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        //? kullanıcı profilini güncellemek için kullanılan firebase metodu
        await updateProfile(auth.currentUser, {
            displayName: displayName
        })
        navigate("/")
        toastSuccessNotify("Registered!")
        console.log(userCredential);
    };
    //* https://console.firebase.google.com/
    //* => Authentication => sign-in-method => enable Email/password
    //! Email/password ile girişi enable yap
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
        navigate("/")
        toastSuccessNotify("Logged in!")

    };
    const logout = () => {
        //*https://firebase.google.com/docs/auth/web/password-auth#next_steps
        signOut(auth)//! sadece signOut metodunu çağırmamız yeterli
        toastSuccessNotify("Logged out!")

    }

    //! Projeyi deploy ettikten sonra google sign in calismasi icin domain listesine deploy linkini ekle \\
    const signGoogleProvider =  async () => {
        try {
         const provider = new GoogleAuthProvider();
         await signInWithPopup(auth, provider)
         navigate("/")
        } catch (error) {
            console.log(error);
        }
    }

    const userObserver = () => {
        //? Kullanıcının signin olup olmadığını takip eden ve kullanıcı değiştiğinde yeni kullanıcıyı response olarak dönen firebase metodu
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/auth.user
                console.log(user)
                const { email, displayName, photoURL } = user;
                console.log(user.displayName)
                setCurrentUser({ email, displayName, photoURL })
            } else {
                // User is signed out
                // ...
                setCurrentUser(false)
            }
        });
    }

    console.log(currentUser)
    useEffect(() => {
        userObserver()//* Kullanıcı giriş çıkışlarını takip ettirmesi için userObserverı tetikliyoruz
    }, [])

    return (
        <AuthContext.Provider value={{ 
            currentUser,
             register, 
             login, 
             logout, 
             signGoogleProvider
             }}>
            {children}
        </AuthContext.Provider>
    );
};

//! zorunlu degil kullanim kolayligi olmasi nedeniyle yazilabilir. Ilgili yerlerde importlari azaltiyor.
//* consumer with custom hook
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export default AuthContextProvider;
