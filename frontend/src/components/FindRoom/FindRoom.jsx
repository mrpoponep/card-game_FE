import React, { useState } from 'react';

const FindRoom = () => {
    const [roomCode, setRoomCode] = useState('');

    const handleNumberClick = (num) => {
        if (roomCode.length < 4) {
            setRoomCode(roomCode + num);
        }
    };

    const handleClear = () => {
        setRoomCode('');
    };

    const handleEnterRoom = async () => {
        if (roomCode.length === 4) {
            try {
                const res = await fetch(`http://localhost:3000/api/room/${roomCode}`);
                if (!res.ok) {
                    alert("Không tìm thấy phòng!");
                    return;
                }
                const data = await res.json();
                alert(`Vào phòng với mã: ${roomCode}\nThông tin phòng: ${JSON.stringify(data)}`);
                // TODO: Chuyển sang màn chơi hoặc xử lý dữ liệu phòng tại đây
            } catch (err) {
                alert("Lỗi kết nối server!");
                console.error(err);
            }
        }
    };

    return (
        <>
            <div className="room-code-section">
                <p>Nhập mã phòng:</p>
                <div className="code-display">
                    {roomCode.split('').map((char, index) => (
                        <span key={index} className="code-char">{char}</span>
                    ))}
                    {Array(4 - roomCode.length).fill('*').map((_, index) => (
                        <span key={`star-${index}`} className="code-char">*</span>
                    ))}
                </div>
                <div className="keypad">
                    <button className="key" onClick={() => handleNumberClick('1')}>1</button>
                    <button className="key" onClick={() => handleNumberClick('2')}>2</button>
                    <button className="key" onClick={() => handleNumberClick('3')}>3</button>
                    <button className="key" onClick={() => handleNumberClick('4')}>4</button>
                    <button className="key" onClick={() => handleNumberClick('5')}>5</button>
                    <button className="key" onClick={() => handleNumberClick('6')}>6</button>
                    <button className="key" onClick={() => handleNumberClick('7')}>7</button>
                    <button className="key" onClick={() => handleNumberClick('8')}>8</button>
                    <button className="key" onClick={() => handleNumberClick('9')}>9</button>
                    <button className="key special" onClick={handleClear}>*</button>
                    <button className="key" onClick={() => handleNumberClick('0')}>0</button>
                    <button className="key special" onClick={() => { }}>#</button>
                </div>
            </div>
            <button className="enter-btn" onClick={handleEnterRoom} disabled={roomCode.length < 4}>
                VÀO PHÒNG
            </button>
        </>
    );
};

export default FindRoom;
