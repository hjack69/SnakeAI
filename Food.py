from constants import *
from graphics import Point, Rectangle
import random


class Food:
    def __init__(self, win, game):
        self.win = win
        self.game = game
        self.position = Point(
            random.randint(0, self.game.size.x),
            random.randint(0, self.game.size.y)
        )
        self.__rectangle = Rectangle(
            self.position + self.game.position,
            self.position + self.game.position + SCALE_V
        )
        self.__rectangle.setFill('green')
        self.__rectangle.draw(self.win)

    def respawn(self):
        self.position = Point(
            random.randint(0, self.game.size.x),
            random.randint(0, self.game.size.y)
        )
        self.__rectangle.undraw()
        self.__rectangle = Rectangle(
            self.position + self.game.position,
            self.position + self.game.position + SCALE_V
        )
        self.__rectangle.draw(self.win)

    def delete(self):
        self.__rectangle.undraw()
