// Инициализация данных с загрузкой из localStorage
let score = parseInt(localStorage.getItem('tapalkaScore')) || 0;
let clickValue = parseInt(localStorage.getItem('tapalkaClickValue')) || 1;
let energy = parseInt(localStorage.getItem('tapalkaEnergy')) || 100;
let maxEnergy = parseInt(localStorage.getItem('tapalkaMaxEnergy')) || 100;
let energyRecoveryRate = 1;

let effectTimeouts = []; // Массив для хранения ID таймеров (теперь с requestAnimationFrame)
let lastTimestamp = 0; // Для отслеживания времени

console.log('Загруженные данные из localStorage:', {
    score,
    clickValue,
    energy,
    maxEnergy
});

// Сохранение данных в localStorage при каждом изменении
const saveProgress = () => {
    localStorage.setItem('tapalkaScore', score);
    localStorage.setItem('tapalkaClickValue', clickValue);
    localStorage.setItem('tapalkaEnergy', energy);
    localStorage.setItem('tapalkaMaxEnergy', maxEnergy);
    console.log('Сохранённый прогресс:', {
        score,
        clickValue,
        energy,
        maxEnergy
    });
};

// Обработчики событий
const setupEventListeners = () => {
    const tapButton = document.getElementById('tapButton');
    const upgradeButton = document.getElementById('upgradeClick');

    tapButton.addEventListener('click', (event) => {
        if (energy >= clickValue) {
            score += clickValue;
            energy -= clickValue;
            updateUI();
            createTapEffect(event);
            saveProgress();
        }
    });

    upgradeButton.addEventListener('click', () => {
        if (score >= 10) {
            score -= 10;
            clickValue += 1;
            updateUI();
            saveProgress();
        }
    });
};

// Эффект при тапе
const createTapEffect = (event) => {
    const effect = document.createElement('div');
    effect.textContent = `+${clickValue}`;
    effect.className = 'tap-effect';
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;

    document.body.appendChild(effect);

    // Создаём собственный таймер с requestAnimationFrame
    let startTime = performance.now();
    const animationFrameId = requestAnimationFrame(function animate(timestamp) {
        const elapsed = timestamp - startTime;
        if (elapsed >= 1000) { // Если прошло 1000 мс (1 секунда)
            try {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
                cancelAnimationFrame(animationFrameId); // Останавливаем анимацию
                effectTimeouts = effectTimeouts.filter(id => id !== animationFrameId); // Удаляем ID из массива
                console.log('Эффект удалён через requestAnimationFrame');
            } catch (e) {
                console.error('Ошибка при удалении эффекта:', e);
            }
            return;
        }
        requestAnimationFrame(animate); // Продолжаем анимацию
    });

    effectTimeouts.push(animationFrameId); // Сохраняем ID для очистки
};

// Восстановление энергии с использованием requestAnimationFrame
let energyAnimationId = null;

const startEnergyRecovery = () => {
    let energyStartTime = performance.now();

    const animateEnergy = (timestamp) => {
        const elapsed = timestamp - energyStartTime;
        if (elapsed >= 1000) { // Если прошла 1 секунда
            if (energy < maxEnergy) {
                energy = Math.min(maxEnergy, energy + energyRecoveryRate);
                updateUI();
                saveProgress();
                console.log('Энергия восстановлена:', energy);
            }
            energyStartTime = timestamp; // Сбрасываем время для следующей секунды
        }
        energyAnimationId = requestAnimationFrame(animateEnergy); // Продолжаем анимацию
    };

    energyAnimationId = requestAnimationFrame(animateEnergy);
};

// Остановка анимации энергии при закрытии приложения
window.onbeforeunload = () => {
    if (energyAnimationId) {
        cancelAnimationFrame(energyAnimationId);
    }
    effectTimeouts.forEach(id => cancelAnimationFrame(id));
};

// Обновление интерфейса
const updateUI = () => {
    document.getElementById('score').textContent = `Счет: ${score}`;
    document.getElementById('energy').textContent = `Энергия: ${energy}/${maxEnergy}`;
    const upgradeButton = document.getElementById('upgradeClick');
    upgradeButton.disabled = score < 10;
    saveProgress();
};

// Инициализация
setupEventListeners();
startEnergyRecovery();