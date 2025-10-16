#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
贪吃蛇游戏
使用pygame实现，包含基本的游戏功能：
- 蛇的移动
- 吃食物
- 碰撞检测
- 分数统计
- 游戏结束检测
"""

import pygame
import random
import sys
from enum import Enum

# 初始化pygame
pygame.init()

# 游戏常量
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
DARK_GREEN = (0, 200, 0)

# 方向枚举
class Direction(Enum):
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)

class SnakeGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("贪吃蛇游戏")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.reset_game()
    
    def reset_game(self):
        """重置游戏状态"""
        # 蛇的初始位置（在屏幕中央）
        center_x = GRID_WIDTH // 2
        center_y = GRID_HEIGHT // 2
        self.snake = [(center_x, center_y), (center_x - 1, center_y), (center_x - 2, center_y)]
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        self.food = self.generate_food()
        self.score = 0
        self.game_over = False
        self.paused = False
    
    def generate_food(self):
        """生成食物位置"""
        while True:
            x = random.randint(0, GRID_WIDTH - 1)
            y = random.randint(0, GRID_HEIGHT - 1)
            if (x, y) not in self.snake:
                return (x, y)
    
    def handle_events(self):
        """处理游戏事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if self.game_over:
                    if event.key == pygame.K_SPACE:
                        self.reset_game()
                    elif event.key == pygame.K_ESCAPE:
                        return False
                else:
                    if event.key == pygame.K_UP and self.direction != Direction.DOWN:
                        self.next_direction = Direction.UP
                    elif event.key == pygame.K_DOWN and self.direction != Direction.UP:
                        self.next_direction = Direction.DOWN
                    elif event.key == pygame.K_LEFT and self.direction != Direction.RIGHT:
                        self.next_direction = Direction.LEFT
                    elif event.key == pygame.K_RIGHT and self.direction != Direction.LEFT:
                        self.next_direction = Direction.RIGHT
                    elif event.key == pygame.K_SPACE:
                        self.paused = not self.paused
                    elif event.key == pygame.K_ESCAPE:
                        return False
        return True
    
    def update_game(self):
        """更新游戏状态"""
        if self.game_over or self.paused:
            return
        
        # 更新方向
        self.direction = self.next_direction
        
        # 计算蛇头的新位置
        head_x, head_y = self.snake[0]
        dx, dy = self.direction.value
        new_head = (head_x + dx, head_y + dy)
        
        # 检查碰撞
        if self.check_collision(new_head):
            self.game_over = True
            return
        
        # 添加新头部
        self.snake.insert(0, new_head)
        
        # 检查是否吃到食物
        if new_head == self.food:
            self.score += 10
            self.food = self.generate_food()
        else:
            # 如果没有吃到食物，移除尾部
            self.snake.pop()
    
    def check_collision(self, head):
        """检查碰撞"""
        x, y = head
        
        # 检查是否撞墙
        if x < 0 or x >= GRID_WIDTH or y < 0 or y >= GRID_HEIGHT:
            return True
        
        # 检查是否撞到自己
        if head in self.snake:
            return True
        
        return False
    
    def draw(self):
        """绘制游戏画面"""
        self.screen.fill(BLACK)
        
        if not self.game_over:
            # 绘制蛇
            for i, segment in enumerate(self.snake):
                x = segment[0] * GRID_SIZE
                y = segment[1] * GRID_SIZE
                color = GREEN if i == 0 else DARK_GREEN  # 蛇头用亮绿色
                pygame.draw.rect(self.screen, color, (x, y, GRID_SIZE, GRID_SIZE))
                pygame.draw.rect(self.screen, WHITE, (x, y, GRID_SIZE, GRID_SIZE), 1)
            
            # 绘制食物
            food_x = self.food[0] * GRID_SIZE
            food_y = self.food[1] * GRID_SIZE
            pygame.draw.rect(self.screen, RED, (food_x, food_y, GRID_SIZE, GRID_SIZE))
            pygame.draw.rect(self.screen, WHITE, (food_x, food_y, GRID_SIZE, GRID_SIZE), 1)
        
        # 绘制分数
        score_text = self.font.render(f"分数: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        # 绘制暂停提示
        if self.paused:
            pause_text = self.font.render("游戏暂停 - 按空格键继续", True, WHITE)
            text_rect = pause_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
            self.screen.blit(pause_text, text_rect)
        
        # 绘制游戏结束画面
        if self.game_over:
            game_over_text = self.font.render("游戏结束!", True, WHITE)
            restart_text = self.font.render("按空格键重新开始", True, WHITE)
            quit_text = self.font.render("按ESC键退出", True, WHITE)
            
            # 居中显示文本
            game_over_rect = game_over_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 40))
            restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
            quit_rect = quit_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 40))
            
            self.screen.blit(game_over_text, game_over_rect)
            self.screen.blit(restart_text, restart_rect)
            self.screen.blit(quit_text, quit_rect)
        
        pygame.display.flip()
    
    def run(self):
        """运行游戏主循环"""
        running = True
        while running:
            running = self.handle_events()
            self.update_game()
            self.draw()
            self.clock.tick(10)  # 控制游戏速度
        
        pygame.quit()
        sys.exit()

def main():
    """主函数"""
    print("贪吃蛇游戏")
    print("控制说明:")
    print("- 使用方向键控制蛇的移动")
    print("- 空格键暂停/继续游戏")
    print("- ESC键退出游戏")
    print("- 游戏结束后按空格键重新开始")
    print("\n开始游戏...")
    
    game = SnakeGame()
    game.run()

if __name__ == "__main__":
    main()
