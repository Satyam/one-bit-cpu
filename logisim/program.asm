      one
      outTo 0
      call sub1
      call sub2
      jmp   end
sub1: out
      ret
sub2: call sub3
      ret
sub3: ret
end:  halt

