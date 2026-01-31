package com.jaee.security;

import com.jaee.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find by email first, then by mobile number
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByMobileNumber(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
