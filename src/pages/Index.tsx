import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Ability = {
  id: string;
  name: string;
  icon: string;
  color: string;
  cooldown: number;
  damage: number;
  currentCooldown: number;
};

type Enemy = {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  type: 'mutant' | 'beast';
};

const Index = () => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMana, setPlayerMana] = useState(100);
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 70 });
  const [abilities, setAbilities] = useState<Ability[]>([
    { id: '1', name: 'Огненный шар', icon: 'Flame', color: '#F97316', cooldown: 2000, damage: 25, currentCooldown: 0 },
    { id: '2', name: 'Ледяной шип', icon: 'Snowflake', color: '#0EA5E9', cooldown: 3000, damage: 35, currentCooldown: 0 },
    { id: '3', name: 'Молния', icon: 'Zap', color: '#D946EF', cooldown: 1500, damage: 20, currentCooldown: 0 },
    { id: '4', name: 'Тёмная волна', icon: 'Waves', color: '#9b87f5', cooldown: 4000, damage: 50, currentCooldown: 0 },
  ]);

  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setAbilities(prev => 
        prev.map(ability => ({
          ...ability,
          currentCooldown: Math.max(0, ability.currentCooldown - 100)
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const spawnInterval = setInterval(() => {
      const newEnemy: Enemy = {
        id: Date.now().toString(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 30 + 10,
        health: 100,
        maxHealth: 100,
        type: Math.random() > 0.5 ? 'mutant' : 'beast'
      };
      setEnemies(prev => [...prev, newEnemy]);
    }, 3000);

    return () => clearInterval(spawnInterval);
  }, [gameStarted]);

  const useAbility = (ability: Ability) => {
    if (ability.currentCooldown > 0 || playerMana < 20) return;

    setPlayerMana(prev => Math.max(0, prev - 20));
    
    setAbilities(prev =>
      prev.map(a => a.id === ability.id ? { ...a, currentCooldown: a.cooldown } : a)
    );

    if (enemies.length > 0) {
      const targetEnemy = enemies[0];
      setEnemies(prev => 
        prev.map(e => {
          if (e.id === targetEnemy.id) {
            const newHealth = e.health - ability.damage;
            if (newHealth <= 0) {
              setScore(s => s + 100);
              return null as any;
            }
            return { ...e, health: newHealth };
          }
          return e;
        }).filter(Boolean)
      );
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!gameStarted) return;
    
    const step = 3;
    setPlayerPos(prev => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'ф':
          return { ...prev, x: Math.max(5, prev.x - step) };
        case 'ArrowRight':
        case 'd':
        case 'в':
          return { ...prev, x: Math.min(95, prev.x + step) };
        case 'ArrowUp':
        case 'w':
        case 'ц':
          return { ...prev, y: Math.max(5, prev.y - step) };
        case 'ArrowDown':
        case 's':
        case 'ы':
          return { ...prev, y: Math.min(85, prev.y + step) };
        default:
          return prev;
      }
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  useEffect(() => {
    if (playerMana < 100) {
      const interval = setInterval(() => {
        setPlayerMana(prev => Math.min(100, prev + 1));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [playerMana]);

  const startGame = () => {
    setGameStarted(true);
    setPlayerHealth(100);
    setPlayerMana(100);
    setScore(0);
    setEnemies([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] via-[#221F26] to-[#403E43] text-white overflow-hidden">
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-[#9b87f5] via-[#D946EF] to-[#F97316] bg-clip-text text-transparent animate-scale-in" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              ЭХОЛОТ
            </h1>
            <p className="text-2xl text-gray-400 max-w-2xl mx-auto">
              Разрушенный мир. Магия пробудилась после катастрофы. Мутанты охотятся на выживших.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                <Card className="p-4 bg-[#403E43]/50 border-[#9b87f5]/30">
                  <h3 className="font-semibold text-[#9b87f5] flex items-center gap-2 mb-2">
                    <Icon name="Gamepad2" size={20} />
                    Управление
                  </h3>
                  <p className="text-sm text-gray-400">WASD / Стрелки — движение</p>
                </Card>
                <Card className="p-4 bg-[#403E43]/50 border-[#D946EF]/30">
                  <h3 className="font-semibold text-[#D946EF] flex items-center gap-2 mb-2">
                    <Icon name="Sparkles" size={20} />
                    Магия
                  </h3>
                  <p className="text-sm text-gray-400">4 способности внизу экрана</p>
                </Card>
              </div>
              <Button 
                size="lg" 
                onClick={startGame}
                className="mt-8 text-xl px-12 py-6 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:scale-105 transition-transform"
              >
                <Icon name="Play" size={24} className="mr-2" />
                Начать игру
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="fixed top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="flex items-center gap-3">
                    <Icon name="Heart" size={20} className="text-red-500" />
                    <div className="flex-1">
                      <Progress value={playerHealth} className="h-3" />
                    </div>
                    <span className="text-sm font-mono">{playerHealth}/100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="Sparkles" size={20} className="text-[#9b87f5]" />
                    <div className="flex-1">
                      <Progress value={playerMana} className="h-3 [&>div]:bg-[#9b87f5]" />
                    </div>
                    <span className="text-sm font-mono">{playerMana}/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {score}
                  </div>
                  <div className="text-sm text-gray-400">очков</div>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="relative w-full h-screen overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, #221F26 0%, #1A1F2C 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#9b87f5] rounded-full blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F97316] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div 
              className="absolute transition-all duration-100 ease-linear z-20"
              style={{ 
                left: `${playerPos.x}%`, 
                top: `${playerPos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-[#D946EF] rounded-lg rotate-45 animate-pulse shadow-2xl shadow-[#9b87f5]/50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="User" size={24} className="-rotate-45" />
                </div>
              </div>
            </div>

            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute transition-all duration-500 z-10"
                style={{
                  left: `${enemy.x}%`,
                  top: `${enemy.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative group">
                  <div className={`w-12 h-12 ${enemy.type === 'mutant' ? 'bg-red-600' : 'bg-orange-600'} rounded-lg rotate-45 shadow-xl animate-pulse`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name={enemy.type === 'mutant' ? 'Skull' : 'Bug'} size={20} className="-rotate-45 text-white" />
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16">
                    <Progress value={(enemy.health / enemy.maxHealth) * 100} className="h-1 bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black/70 to-transparent">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-4 gap-4">
                {abilities.map((ability, index) => {
                  const isReady = ability.currentCooldown === 0 && playerMana >= 20;
                  const cooldownPercent = (ability.currentCooldown / ability.cooldown) * 100;
                  
                  return (
                    <button
                      key={ability.id}
                      onClick={() => useAbility(ability)}
                      disabled={!isReady}
                      className={`relative group ${isReady ? 'hover:scale-105' : 'opacity-50'} transition-all duration-200`}
                    >
                      <Card className="p-4 bg-[#403E43]/90 border-2 hover:border-opacity-100 transition-all"
                        style={{ borderColor: isReady ? ability.color : '#403E43' }}
                      >
                        <div className="text-center space-y-2">
                          <div className="flex justify-center">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ 
                                background: isReady 
                                  ? `radial-gradient(circle, ${ability.color}40, transparent)` 
                                  : 'transparent'
                              }}
                            >
                              <Icon name={ability.icon} size={24} style={{ color: ability.color }} />
                            </div>
                          </div>
                          <div className="text-sm font-semibold">{ability.name}</div>
                          <div className="text-xs text-gray-400">{ability.damage} урона</div>
                          <div className="text-xs font-mono text-gray-500">{index + 1}</div>
                        </div>
                        {ability.currentCooldown > 0 && (
                          <div 
                            className="absolute inset-0 bg-black/60 rounded-lg transition-all duration-100"
                            style={{ height: `${cooldownPercent}%`, top: 0 }}
                          />
                        )}
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
