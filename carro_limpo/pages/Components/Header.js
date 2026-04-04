export default function Header() {
    return (
        <header className="bg-[#a1afc4]">
            <nav>

                <ul className="flex space-x-5 p-5 justify-center">

                    <li className="hover:underline">
                        <a href="/" >HOME</a>
                    </li>

                    <li className="hover:underline">
                        <a href="/" >SERVIÇOS</a>
                    </li>

                    <li className="hover:underline">
                        <a href="/" >CHATBOT</a>
                    </li>


                </ul>

            </nav>
        </header>
    )
}