import React from 'react'

function Error({ error }) {
  return (
    <div className='flex justify-center items-center'>
        {error ? <h1 className='text-2xl' >{error}</h1> : <h1 className='text-2xl'>404 Not Found</h1>}
    </div>
  )
}

export default Error