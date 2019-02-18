from constants import *
from Snake import Snake
from Food import Food
from graphics import Rectangle, Text, update

class Game:
    def __init__ (self, position, size, win, counter):
        self.position = position
        self.size = size
        self.win = win
        self.counter = counter
        self.brain = None
        self.genome = None
        bl = Point(position.x + size.x*SCALE, position.y + size.y*SCALE)
        self.__rectangle = Rectangle(position, bl)
        self.__rectangle.setFill('black')
        self.__rectangle.draw(self.win)
        self.__text = Text(self.position + Point(20, 20), '0')
        self.__text.setFill('grey')
        self.__text.draw(win)
        update()
        self.snake = Snake(win, self)
        self.food = Food(win, self)

    def reset():
        self.__rectanlge.setFill('black')
        self.__text.setFill('grey')
        self.head.reset()
        self.food.reset()

    def set_brain(self, brain, genome):
        genome.fitness = 0
        self.brain = brain
        self.genome = genome
        self.snake.brain = brain
        self.snake.genome = genome

    def update(self):
        self.snake.update()
        self.__text.setText(str(self.genome.fitness))

    def end_game(self):
        self.__rectangle.setFill('red')
        self.__text.setFill('black')
        self.snake.delete()
        self.food.delete()
        self.counter.decrease
