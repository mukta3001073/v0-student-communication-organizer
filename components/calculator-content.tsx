"use client"

import React from "react"

import { useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Delete, Divide, X, Minus, Plus, Equal, Percent, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Operation = "+" | "-" | "*" | "/" | "%" | "^" | "sqrt" | "sin" | "cos" | "tan" | "log" | "ln" | null

export function CalculatorContent() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<Operation>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [memory, setMemory] = useState<number>(0)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const clearEntry = () => {
    setDisplay("0")
  }

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }

  const toggleSign = () => {
    const value = parseFloat(display)
    setDisplay(String(-value))
  }

  const performOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation)
      const historyEntry = `${previousValue} ${operation} ${inputValue} = ${result}`
      setHistory([historyEntry, ...history.slice(0, 9)])
      setDisplay(String(result))
      setPreviousValue(result)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case "+": return a + b
      case "-": return a - b
      case "*": return a * b
      case "/": return b !== 0 ? a / b : 0
      case "%": return a % b
      case "^": return Math.pow(a, b)
      default: return b
    }
  }

  const calculateResult = () => {
    if (operation === null || previousValue === null) return

    const inputValue = parseFloat(display)
    const result = calculate(previousValue, inputValue, operation)
    const historyEntry = `${previousValue} ${operation} ${inputValue} = ${result}`
    setHistory([historyEntry, ...history.slice(0, 9)])
    setDisplay(String(result))
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }

  // Scientific functions
  const scientificOperation = (func: string) => {
    const value = parseFloat(display)
    let result: number

    switch (func) {
      case "sqrt": result = Math.sqrt(value); break
      case "square": result = value * value; break
      case "sin": result = Math.sin(value * Math.PI / 180); break
      case "cos": result = Math.cos(value * Math.PI / 180); break
      case "tan": result = Math.tan(value * Math.PI / 180); break
      case "log": result = Math.log10(value); break
      case "ln": result = Math.log(value); break
      case "exp": result = Math.exp(value); break
      case "1/x": result = 1 / value; break
      case "pi": result = Math.PI; break
      case "e": result = Math.E; break
      case "fact": result = factorial(Math.floor(value)); break
      default: result = value
    }

    const historyEntry = `${func}(${value}) = ${result}`
    setHistory([historyEntry, ...history.slice(0, 9)])
    setDisplay(String(result))
    setWaitingForOperand(true)
  }

  const factorial = (n: number): number => {
    if (n <= 1) return 1
    return n * factorial(n - 1)
  }

  // Memory functions
  const memoryClear = () => setMemory(0)
  const memoryRecall = () => {
    setDisplay(String(memory))
    setWaitingForOperand(true)
  }
  const memoryAdd = () => setMemory(memory + parseFloat(display))
  const memorySubtract = () => setMemory(memory - parseFloat(display))

  const BasicButton = ({ children, onClick, className, variant = "outline" }: { 
    children: React.ReactNode
    onClick: () => void
    className?: string
    variant?: "default" | "outline" | "secondary" | "ghost"
  }) => (
    <Button
      variant={variant}
      className={cn("h-14 text-lg font-medium", className)}
      onClick={onClick}
    >
      {children}
    </Button>
  )

  return (
    <div className="flex min-h-svh flex-col bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Math Calculator</h1>
            <p className="text-sm text-muted-foreground">Basic & Scientific</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="scientific">Scientific</TabsTrigger>
          </TabsList>

          {/* Display */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-right">
                {previousValue !== null && operation && (
                  <div className="text-sm text-muted-foreground mb-1">
                    {previousValue} {operation}
                  </div>
                )}
                <div className="text-3xl font-bold truncate">{display}</div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="basic" className="mt-0">
            <div className="grid grid-cols-4 gap-2">
              <BasicButton onClick={clear} variant="secondary">AC</BasicButton>
              <BasicButton onClick={toggleSign} variant="secondary">+/-</BasicButton>
              <BasicButton onClick={() => performOperation("%")} variant="secondary">
                <Percent className="h-5 w-5" />
              </BasicButton>
              <BasicButton onClick={() => performOperation("/")} variant="default" className="bg-primary">
                <Divide className="h-5 w-5" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("7")}>7</BasicButton>
              <BasicButton onClick={() => inputDigit("8")}>8</BasicButton>
              <BasicButton onClick={() => inputDigit("9")}>9</BasicButton>
              <BasicButton onClick={() => performOperation("*")} variant="default" className="bg-primary">
                <X className="h-5 w-5" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("4")}>4</BasicButton>
              <BasicButton onClick={() => inputDigit("5")}>5</BasicButton>
              <BasicButton onClick={() => inputDigit("6")}>6</BasicButton>
              <BasicButton onClick={() => performOperation("-")} variant="default" className="bg-primary">
                <Minus className="h-5 w-5" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("1")}>1</BasicButton>
              <BasicButton onClick={() => inputDigit("2")}>2</BasicButton>
              <BasicButton onClick={() => inputDigit("3")}>3</BasicButton>
              <BasicButton onClick={() => performOperation("+")} variant="default" className="bg-primary">
                <Plus className="h-5 w-5" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("0")} className="col-span-2">0</BasicButton>
              <BasicButton onClick={inputDecimal}>.</BasicButton>
              <BasicButton onClick={calculateResult} variant="default" className="bg-primary">
                <Equal className="h-5 w-5" />
              </BasicButton>
            </div>
          </TabsContent>

          <TabsContent value="scientific" className="mt-0">
            <div className="grid grid-cols-5 gap-2">
              {/* Row 1 - Memory & Clear */}
              <BasicButton onClick={memoryClear} variant="ghost" className="text-sm h-12">MC</BasicButton>
              <BasicButton onClick={memoryRecall} variant="ghost" className="text-sm h-12">MR</BasicButton>
              <BasicButton onClick={memoryAdd} variant="ghost" className="text-sm h-12">M+</BasicButton>
              <BasicButton onClick={memorySubtract} variant="ghost" className="text-sm h-12">M-</BasicButton>
              <BasicButton onClick={backspace} variant="secondary" className="h-12">
                <Delete className="h-4 w-4" />
              </BasicButton>

              {/* Row 2 - Scientific functions */}
              <BasicButton onClick={() => scientificOperation("sin")} variant="secondary" className="text-sm h-12">sin</BasicButton>
              <BasicButton onClick={() => scientificOperation("cos")} variant="secondary" className="text-sm h-12">cos</BasicButton>
              <BasicButton onClick={() => scientificOperation("tan")} variant="secondary" className="text-sm h-12">tan</BasicButton>
              <BasicButton onClick={() => scientificOperation("log")} variant="secondary" className="text-sm h-12">log</BasicButton>
              <BasicButton onClick={() => scientificOperation("ln")} variant="secondary" className="text-sm h-12">ln</BasicButton>

              {/* Row 3 */}
              <BasicButton onClick={() => scientificOperation("sqrt")} variant="secondary" className="text-sm h-12">{"sqrt"}</BasicButton>
              <BasicButton onClick={() => scientificOperation("square")} variant="secondary" className="text-sm h-12">{"x^2"}</BasicButton>
              <BasicButton onClick={() => performOperation("^")} variant="secondary" className="text-sm h-12">{"x^y"}</BasicButton>
              <BasicButton onClick={() => scientificOperation("1/x")} variant="secondary" className="text-sm h-12">1/x</BasicButton>
              <BasicButton onClick={() => scientificOperation("fact")} variant="secondary" className="text-sm h-12">n!</BasicButton>

              {/* Row 4 */}
              <BasicButton onClick={() => scientificOperation("pi")} variant="secondary" className="text-sm h-12">pi</BasicButton>
              <BasicButton onClick={() => scientificOperation("e")} variant="secondary" className="text-sm h-12">e</BasicButton>
              <BasicButton onClick={clear} variant="secondary" className="text-sm h-12">AC</BasicButton>
              <BasicButton onClick={toggleSign} variant="secondary" className="text-sm h-12">+/-</BasicButton>
              <BasicButton onClick={() => performOperation("/")} variant="default" className="bg-primary h-12">
                <Divide className="h-4 w-4" />
              </BasicButton>

              {/* Number pad */}
              <BasicButton onClick={() => inputDigit("7")} className="h-12">7</BasicButton>
              <BasicButton onClick={() => inputDigit("8")} className="h-12">8</BasicButton>
              <BasicButton onClick={() => inputDigit("9")} className="h-12">9</BasicButton>
              <BasicButton onClick={() => performOperation("%")} variant="secondary" className="h-12">
                <Percent className="h-4 w-4" />
              </BasicButton>
              <BasicButton onClick={() => performOperation("*")} variant="default" className="bg-primary h-12">
                <X className="h-4 w-4" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("4")} className="h-12">4</BasicButton>
              <BasicButton onClick={() => inputDigit("5")} className="h-12">5</BasicButton>
              <BasicButton onClick={() => inputDigit("6")} className="h-12">6</BasicButton>
              <BasicButton onClick={() => scientificOperation("exp")} variant="secondary" className="text-sm h-12">exp</BasicButton>
              <BasicButton onClick={() => performOperation("-")} variant="default" className="bg-primary h-12">
                <Minus className="h-4 w-4" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("1")} className="h-12">1</BasicButton>
              <BasicButton onClick={() => inputDigit("2")} className="h-12">2</BasicButton>
              <BasicButton onClick={() => inputDigit("3")} className="h-12">3</BasicButton>
              <BasicButton onClick={inputDecimal} className="h-12">.</BasicButton>
              <BasicButton onClick={() => performOperation("+")} variant="default" className="bg-primary h-12">
                <Plus className="h-4 w-4" />
              </BasicButton>

              <BasicButton onClick={() => inputDigit("0")} className="col-span-2 h-12">0</BasicButton>
              <BasicButton onClick={() => inputDigit("00")} className="h-12">00</BasicButton>
              <BasicButton onClick={calculateResult} variant="default" className="col-span-2 bg-primary h-12">
                <Equal className="h-4 w-4" />
              </BasicButton>
            </div>
          </TabsContent>
        </Tabs>

        {/* History */}
        {history.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">History</h3>
                <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <div key={index} className="text-sm text-muted-foreground font-mono">
                    {entry}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
