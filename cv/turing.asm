# https://en.wikipedia.org/wiki/Turing_machine_examples#Turing's_first_example

# Configuration    Behavior
# state    Tape symbol    Tape operations    new state
#   b          blank        P0, R             c
#   c          blank        R                 e
#   e          blank        P1, R             f
#   f          blank        R                 b

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
end: halt

# https://en.wikipedia.org/wiki/Turing_machine_examples#A_copy_subroutine


#  State  Symbol   Print Operation Next State
#   s1      0        N       N            H
#   s1      1        E       R            s2
#   s2      0        E       R            s3
#   s2      1        P1      R            s2
#   s3      0        P1      L            s4
#   s3      1        P1      R            s3
#   s4      0        E       L            s5
#   s4      1        P1      L            s4
#   s5      0        P1      R            s1
#   s5      1        P1      L            s5
#   H       —        —       —

# Setup:
      org   64
      one
      outTo 7
      outTo 8
      inFrom 8
#run:

s1:   jmpt s1_1

#   s1    0      N       N            H
s1_0: halt

#   s1    1      E       R            s2
s1_1:  zero
      out
      inNext
      jmp s2

s2:   jmpt s2_1
#   s2    0      E       R            s3
s2_0:  zero
      out
      inNext
      jmp s3
#   s2    1      P1       R            s2
s2_1: one
      out
      inNext
      jmp s2

s3:   jmpt  s3_1
#   s3    0      P1       L            s4
s3_0: one
      out
      inPrev
      jmp s4
#   s3    1      P1       R            s3
s3_1: one
      out
      inNext
      jmp s3

s4:   jmpt  s4_1
#   s4    0      E       L            s5
s4_0: zero
      out
      inPrev
      jmp s5
#   s4    1      P1       L            s4
s4_1: one
      out
      inPrev
      jmp   s4

s5:   jmpt  s5_1
#   s5    0      P1       R            s1
s5_0: one
      out
      inNext
      jmp   s1
#   s5    1      P1       L            s5
s5_1: one
      out
      inPrev
      jmp   s5
