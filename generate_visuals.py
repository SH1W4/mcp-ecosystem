#!/usr/bin/env python3
"""
Gerador de Visualizações ASCII para o Sistema Simbiótico
"""

import time
import random
from typing import Dict, List
from colorama import init, Fore, Back, Style

# Inicializar colorama para Windows
init()

class SymbioticVisualizer:
    """Gera visualizações ASCII avançadas para métricas do sistema"""
    
    def __init__(self):
        self.metrics = {
            'coherence': 0.875,
            'stability': 0.923,
            'fidelity': 0.941,
            'adaptation': 0.768
        }
        
    def generate_bar(self, value: float, width: int = 20, filled='█', empty='░') -> str:
        """Gera uma barra de progresso ASCII"""
        filled_width = int(value * width)
        empty_width = width - filled_width
        return filled * filled_width + empty * empty_width
    
    def generate_gauge(self, value: float, label: str) -> str:
        """Gera um medidor circular ASCII"""
        percentage = int(value * 100)
        
        # Definir cor baseada no valor
        if value >= 0.9:
            color = Fore.GREEN
        elif value >= 0.7:
            color = Fore.YELLOW
        else:
            color = Fore.RED
            
        gauge = f"""
    ╭─────╮
    │ {color}{percentage:3d}%{Style.RESET_ALL} │ {label}
    ╰─────╯
        """
        return gauge
    
    def generate_dashboard(self) -> str:
        """Gera um dashboard completo"""
        dashboard = f"""
{Fore.CYAN}╔═══════════════════════════════════════════════════════════════════════╗
║                     PAINEL DE MÉTRICAS SIMBIÓTICAS                     ║
╚═══════════════════════════════════════════════════════════════════════╝{Style.RESET_ALL}

┌─────────────────── INDICADORES PRINCIPAIS ───────────────────┐
│                                                              │
│  Coerência Sistêmica    [{self.generate_bar(self.metrics['coherence'])}] {self.metrics['coherence']*100:.1f}%    │
│  Estabilidade          [{self.generate_bar(self.metrics['stability'])}] {self.metrics['stability']*100:.1f}%    │
│  Fidelidade de Estado  [{self.generate_bar(self.metrics['fidelity'])}] {self.metrics['fidelity']*100:.1f}%    │
│  Taxa de Adaptação     [{self.generate_bar(self.metrics['adaptation'])}] {self.metrics['adaptation']*100:.1f}%    │
│                                                              │
│  {Fore.GREEN}SCORE OPERACIONAL: {self.generate_bar(sum(self.metrics.values())/4)} {sum(self.metrics.values())/4*100:.3f}%{Style.RESET_ALL}    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
        """
        return dashboard
    
    def generate_evolution_graph(self) -> str:
        """Gera um gráfico de evolução"""
        graph = """
EVOLUÇÃO TEMPORAL
    │
100%├─────────────────────────────────────
    │                                ╭─●
 90%│                           ╭────╯
    │                      ╭────╯
 80%│                 ╭────╯
    │            ╭────╯
 70%│       ╭────╯
    │  ╭────╯
 60%├──●
    │
 50%└────┬────┬────┬────┬────┬────┬────
        T-6  T-5  T-4  T-3  T-2  T-1  NOW
        """
        return graph
    
    def animate_loading(self, duration: int = 3):
        """Anima uma barra de carregamento"""
        frames = ['▓░░░░', '▓▓░░░', '▓▓▓░░', '▓▓▓▓░', '▓▓▓▓▓']
        
        for _ in range(duration):
            for frame in frames:
                print(f'\rProcessando {frame}', end='', flush=True)
                time.sleep(0.2)
        print('\rProcessamento completo! ▓▓▓▓▓')
    
    def generate_network_map(self) -> str:
        """Gera um mapa de rede de conexões"""
        network = """
          ┌─────────┐
          │ USUÁRIO │
          └────┬────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────▼────┐   ┌───▼────┐
   │  GIDEN  │   │ VIREON │
   └────┬────┘   └───┬────┘
        │            │
        └─────┬──────┘
              │
         ┌────▼────┐
         │  NEXUS  │
         └─────────┘
        """
        return network

def main():
    """Função principal para demonstração"""
    viz = SymbioticVisualizer()
    
    # Mostrar dashboard
    print(viz.generate_dashboard())
    
    # Mostrar evolução
    print(viz.generate_evolution_graph())
    
    # Mostrar rede
    print(viz.generate_network_map())
    
    # Animar carregamento
    print("\nInicializando sistema simbiótico...")
    viz.animate_loading(2)

if __name__ == "__main__":
    main()
