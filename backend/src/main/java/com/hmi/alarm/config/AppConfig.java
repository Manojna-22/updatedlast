package com.hmi.alarm.config;

import com.hmi.alarm.dto.AlarmEventDto;
import com.hmi.alarm.entity.AlarmEvent;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Application-level bean configuration.
 */
@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        // Map AlarmEvent → AlarmEventDto (flatten alarmId)
        TypeMap<AlarmEvent, AlarmEventDto> eventMap =
                mapper.createTypeMap(AlarmEvent.class, AlarmEventDto.class);
        eventMap.addMapping(src -> src.getAlarm().getId(), AlarmEventDto::setAlarmId);

        return mapper;
    }
}
