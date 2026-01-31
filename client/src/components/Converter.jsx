import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

function Converter() {

    const [pixel, setPixel] = useState(16)
    console.log(pixel)
    const [rem, setRem] = useState(1)

    useEffect(() => {
        setRem(pixel/16)
    }, [pixel])

    useEffect(() => {
        setPixel(rem*16)
    }, [rem])

    return (
        <div>
            <div className="">
                <p>Pixels</p>
                <input type="text" name='pixel' value={pixel} onChange={(e) => setPixel(e.target.value)} />
            </div>
            <div className="">
                <p>REM</p>
                <input type="text" name='rem' value={rem} onChange={(e) => setRem(e.target.value)} />
            </div>
        </div>
    )
}

export default Converter