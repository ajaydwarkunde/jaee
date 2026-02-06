package com.jaee.service;

import com.jaee.dto.address.AddressCreateRequest;
import com.jaee.dto.address.AddressDto;
import com.jaee.entity.Address;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;

    public List<AddressDto> getUserAddresses(User user) {
        return addressRepository.findByUser(user).stream()
                .map(AddressDto::fromEntity)
                .collect(Collectors.toList());
    }

    public AddressDto getAddressById(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BadRequestException("Address not found"));
        return AddressDto.fromEntity(address);
    }

    @Transactional
    public AddressDto createAddress(User user, AddressCreateRequest request) {
        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserAndIsDefaultTrue(user)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        // If this is the first address, make it default
        List<Address> existing = addressRepository.findByUser(user);
        boolean makeDefault = existing.isEmpty() || Boolean.TRUE.equals(request.getIsDefault());

        Address address = Address.builder()
                .user(user)
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .zip(request.getZip())
                .phone(request.getPhone())
                .isDefault(makeDefault)
                .build();

        Address saved = addressRepository.save(address);
        log.info("Address created for user {}: {}", user.getId(), saved.getId());
        return AddressDto.fromEntity(saved);
    }

    @Transactional
    public AddressDto updateAddress(User user, Long addressId, AddressCreateRequest request) {
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BadRequestException("Address not found"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserAndIsDefaultTrue(user)
                    .ifPresent(addr -> {
                        if (!addr.getId().equals(addressId)) {
                            addr.setIsDefault(false);
                            addressRepository.save(addr);
                        }
                    });
        }

        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry() != null ? request.getCountry() : address.getCountry());
        address.setZip(request.getZip());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : address.getIsDefault());

        Address saved = addressRepository.save(address);
        return AddressDto.fromEntity(saved);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BadRequestException("Address not found"));
        addressRepository.delete(address);
        log.info("Address {} deleted for user {}", addressId, user.getId());
    }

    @Transactional
    public AddressDto setDefault(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BadRequestException("Address not found"));

        // Unset current default
        addressRepository.findByUserAndIsDefaultTrue(user)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });

        address.setIsDefault(true);
        Address saved = addressRepository.save(address);
        return AddressDto.fromEntity(saved);
    }
}
