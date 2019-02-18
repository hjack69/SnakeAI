from constants import *
from graphics import Point, Rectangle, update

class Part:
    def __init__(self, win, game, position, next=None):
        self.win = win

        # This is the relative position without any scale
        self.position = position.clone()

        self.game = game
        self.next = next

        # This uses the true screen position
        self.__rectangle = Rectangle(
            self.position + (self.game.position * SCALE_V),
            self.position + (self.game.position * SCALE_V)
        )
        self.__rectangle.setFill('red')
        self.__rectangle.draw(self.win)

    def update(self, position):
        oldPos = self.position.clone()
        self.position = position
        self.__rectangle.move(
            (oldPos.x - self.position.x) * SCALE,
            (oldPos.y - self.position.y) * SCALE
        )
        update()
        if self.next:
            self.next.update(oldPos)

    def add_part(self):
        return Part(self.win, self.game, self.position.clone(), self)

    def is_colliding(self, p=None):
        if not p:
            if self.next:
                return self.next.is_colliding(self.position.clone())
            else:
                return False
        else:
            if p == self.position:
                return True
            else:
                if self.next:
                    return self.next.is_colliding(p)
        return False

    def delete(self):
        self.__rectangle.undraw()
        if self.next:
            self.next.delete()
