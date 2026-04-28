# https://en.wikipedia.org/wiki/Turing_machine_examples#Turing's_first_example

# Configuration    Behavior
# state        symbol    Print  move    new state
#   b          blank        0   R             c
#   c          blank            R             e
#   e          blank        1   R             f
#   f          blank            R             b

# The issue is that blank, 0 and 1 are three states so it is not binary
# I changed so that 0 is blank, which means it will have 1's spaced three 0's apart
# Also, I added a 1 at the right most position so that it marks the end of the run.

# setup
      org   0
      one
      outTo 15
      inFrom 0
# run
b:    jmpt  end
      zero
      inNext
      jmp   c

c:    jmpt  end
      inNext
      jmp   e

e:    jmpt  end
      one
      out
      inNext
      jmp   f

f:    jmpt  end
      inNext
      jmp   b

end:  halt

# https://en.wikipedia.org/wiki/Turing_machine_examples#A_copy_subroutine


#  State  Symbol   Print Operation Next State
#   s1      0        -       -            H
#   s1      1        0       R            s2
#   s2      0        0       R            s3
#   s2      1        1       R            s2
#   s3      0        1       L            s4
#   s3      1        1       R            s3
#   s4      0        0       L            s5
#   s4      1        1       L            s4
#   s5      0        1       R            s1
#   s5      1        1       L            s5
#   H       —        —       —

# Setup:
      org   64
      one
      outTo 7
      outTo 8
      inFrom 8
#run:

s1:   jmpt s1_1

#   s1    0      -       -            H
s1_0: halt

#   s1    1      0       R            s2
s1_1: zero
      out
      inPrev
      jmp s2

s2:   jmpt s2_1

#   s2    0      0       R            s3
s2_0: zero
      out
      inPrev
      jmp s3

#   s2    1      1       R            s2
s2_1: one
      out
      inPrev
      jmp s2

s3:   jmpt  s3_1

#   s3    0      1       L            s4
s3_0: one
      out
      inNext
      jmp s4

#   s3    1      1       R            s3
s3_1: one
      out
      inPrev
      jmp s3

s4:   jmpt  s4_1
#   s4    0      0       L            s5
s4_0: zero
      out
      inNext
      jmp s5

#   s4    1      1       L            s4
s4_1: one
      out
      inNext
      jmp   s4

s5:   jmpt  s5_1

#   s5    0      1       R            s1
s5_0: one
      out
      inPrev
      jmp   s1

#   s5    1      1       L            s5
s5_1: one
      out
      inNext
      jmp   s5

# https://en.wikipedia.org/wiki/Turing_machine_examples#3-state_Busy_Beaver
# Busy beaver

#  State  Symbol   Print Operation Next State
#   A        0       1       L         B
#   A        1       1       R         C
#   B        0       1       R         A
#   B        1       1       L         B
#   C        0       1       R         B
#   C        1       1       -         Halt

# setup
      org 128
      inFrom  8

# run

A:    jmpt  A_1

#   A        0       1       L         B
A_0:  one
      out
      inNext
      jmp   B

#   A        1       1       R         C
A_1:  one
      out
      inPrev
      jmp C

B:    jmpt  B_1

#   B        0       1       R         A
B_0:  one
      out
      inPrev
      jmp A

#   B        1       1       L         B
B_1:  one
      out
      inNext
      jmp   B

C:    jmpt  C_1

#   C        0       1       R         B
C_0:  one
      out
      inPrev
      jmp B

#   C        1       1       -         Halt
C_1:  one
      out
      halt
