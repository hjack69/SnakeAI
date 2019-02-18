from graphics import Point
from constants import *
from Part import *

class Snake:
    def __init__(self, win, game):
        self.win = win
        self.game = game
        self.brain = None
        self.genome = None
        self.head = Part(win, game, Point(game.size.x/2, game.size.y/2))
        self.head.add_part()
        self.lastDirection = Point(1, 0)
        self.lastDistance = 999999
        self.dead = False

    def reset(self):
        if self.head:
            self.head.delete()
            self.head = None
        self.head = Part(self.win, self.game, Point(game.size.x/2, game.size.y/2))
        self.head.add_part()
        self.lastDirection = Point(1, 0)
        self.lastDistance = 999999
        self.dead = False

    def update(self):
        if not self.dead:
            input = [0]*9
            fp = self.head.position + self.lastDirection
            lp = Point(
                self.head.position.x + self.lastDirection.y,
                self.head.position.y - self.lastDirection.x
            )
            rp = Point(
                self.head.position.x - self.lastDirection.y,
                self.head.position.y + self.lastDirection.x
            )

            input[0] = 1 if self.head.is_colliding(fp) else 0
            input[1] = 1 if self.game.food.position == fp else 0
            input[2] = 1 if not input[0] and not input[1] else 0

            input[3] = 1 if self.head.is_colliding(lp) else 0
            input[4] = 1 if self.game.food.position == lp else 0
            input[5] = 1 if not input[3] and not input[4] else 0

            input[6] = 1 if self.head.is_colliding(rp) else 0
            input[7] = 1 if self.game.food.position == rp else 0
            input[8] = 1 if not input[6] and not input[7] else 0

            output = self.brain.activate(input)
            np = [fp, lp, rp]
            d = np[output.index(max(output))]

            self.lastDirection = Point(d.x - self.head.position.x, d.y - self.head.position.y)

            self.head.update(d)

            dis = (
                (self.game.food.position.x - self.head.position.x) ** 2 +
                (self.game.food.position.y - self.head.position.y) ** 2
            ) ** 0.5
            if dis < self.lastDistance:
                self.genome.fitness += CLOSER_SCORE
            elif dis > self.lastDistance:
                self.genome.fitness += FURTHER_SCORE
            self.lastDistance = dis

            if self.game.food.position == self.head.position:
                self.head.add_part()
                self.game.food.respawn()
                self.genome.fitness += EAT_SCORE
            elif self.head.is_colliding() or \
                 self.head.position.x < 0 or self.head.position.x >= self.game.size.x or \
                 self.head.position.y < 0 or self.head.position.y >= self.game.size.y:
                self.game.end_game()

    def delete(self):
        self.head.delete()
        self.head = None
        self.dead = True
